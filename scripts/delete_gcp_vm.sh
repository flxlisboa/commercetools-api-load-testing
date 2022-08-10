#! /bin/bash

set -e
VM_NAME=""
GCP_ZONE="europe-west3-c"
GCP_PROJECT="professionalserviceslabs"

help() {
  echo ""
  echo "Usage: delete_gcp_vm -n <vm-name> "
  echo -e "\t-n Name of the VM instance (required)."
  echo -e "\t-p Your Google Cloud Platform project ID (optional). Defaults to '$GCP_PROJECT'"
  echo -e "\t-z Zone of the VM instance (optional). Defaults to '$GCP_ZONE'"
  echo -e "\t-h Display help."
  exit 1 # Exit script after printing help
}

while getopts "n:z:p:h" opt; do
  case "$opt" in
  n) VM_NAME="$OPTARG" ;;
  z) GCP_ZONE="$OPTARG" ;;
  p) GCP_PROJECT="$OPTARG" ;;
  h) help ;;
  *) help ;;
  esac
done

if [ -z "$VM_NAME" ]
then
   echo "The option -n (name of the virtual machine) is required ";
   help
fi

gcloud compute instances delete $VM_NAME --zone=$GCP_ZONE --project "$GCP_PROJECT"
