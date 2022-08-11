#! /bin/bash

set -e
VM_NAME=""
GCP_ZONE="europe-west3-c"
GCP_PROJECT="k6-testing"
GCP_MACHINE_TYPE="e2-standard-16"

help() {
  echo ""
  echo "Usage: create_gcp_vm -n <vm-name> -p <project> -z <zone> -m <machine-type> -s <boot-disk-size> -t <boot-disk-type> -h "
  echo -e "\t-n A user defined name for the VM instance (required)."
  echo -e "\t-p Your Google Cloud Platform project ID (optional). Defaults to '$GCP_PROJECT'"
  echo -e "\t-z Zone of the instance to create (optional). Defaults to '$GCP_ZONE'"
  echo -e "\t-m Specifies the machine type used for the instance (optional). Defaults to '$GCP_MACHINE_TYPE'"
  echo -e "\t-h Display help"
  exit 1 # Exit script after printing help
}

while getopts "n:p:z:m:s:t:h" opt; do
  case "$opt" in
  n) VM_NAME="$OPTARG" ;;
  p) GCP_PROJECT="$OPTARG" ;;
  z) GCP_ZONE="$OPTARG" ;;
  m) GCP_MACHINE_TYPE="$OPTARG" ;;
  h) help ;;
  *) help ;;
  esac
done

if [ -z "$VM_NAME" ]
then
   echo "The option -n (name of the VM instance) is required ";
   help
fi

# Create VM
gcloud compute instances create $VM_NAME \
--zone=$GCP_ZONE \
--project "$GCP_PROJECT" \
--machine-type=$GCP_MACHINE_TYPE

# Wait until the VM is ready
sleep 30

gcloud compute ssh $VM_NAME --zone $GCP_ZONE --project "$GCP_PROJECT" --command="bash -s" <<EOF
cd ~

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

curl -sSO https://dl.google.com/cloudagents/add-monitoring-agent-repo.sh
sudo bash add-monitoring-agent-repo.sh --also-install

curl -sSO https://dl.google.com/cloudagents/add-logging-agent-repo.sh
sudo bash add-logging-agent-repo.sh
sudo apt update
sudo apt install google-fluentd
sudo apt install -y google-fluentd-catch-all-config
touch /tmp/k6_console.log

sudo apt install git-all << ANSWERS
yes
ANSWERS

EOF

sleep 10
echo "Install special fluentd config for k6"
gcloud compute scp ../scripts/conf/k6_console.conf $VM_NAME:/etc/google-fluentd/config.d/ --zone=$GCP_ZONE
gcloud compute ssh $VM_NAME --zone $GCP_ZONE --project "$GCP_PROJECT" --command="bash -s" <<EOF
  echo "restarting fluentd service"
  sudo service google-fluentd restart
EOF

echo "You can now access your VM using the command: gcloud compute ssh $VM_NAME --zone $GCP_ZONE --project '$GCP_PROJECT'"
