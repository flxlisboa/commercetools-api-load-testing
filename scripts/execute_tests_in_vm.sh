#! /bin/bash

set -e
VM_NAME=""
GIT_TOKEN=""
GIT_USER_EMAIL=""
GIT_BRANCH="main"
GCP_ZONE="europe-west3-c"
GCP_PROJECT="professionalserviceslabs"
OPEN_FILES_LIMIT="250000"
SCENARIO_NAME=""

help() {
  echo ""
  echo "Usage: execute_tests_in_vm -n <vm-name> -g <github-token> -m <github-user-email> -s <scenario-name> -b <github-branch> -p <project> -z <zone> -u <open-files-limit> -h "
  echo -e "\t-n The name of VM instance (required)."
  echo -e "\t-g Your github access token value (required)."
  echo -e "\t-m Your github user email (required)."
  echo -e "\t-b Github repository branch (optional). Defaults to '$GIT_BRANCH"
  echo -e "\t-p Your Google Cloud Platform project ID (optional). Defaults to '$GCP_PROJECT'"
  echo -e "\t-z Zone of the instance (optional). Defaults to '$GCP_ZONE'"
  echo -e "\t-u To set the open files limit(ulimit) in the VM instance (optional). Defaults to '$OPEN_FILES_LIMIT'"
  echo -e "\t-s Load test scenario name to run (required)."
  echo -e "\t-h Display help"
  exit 1 # Exit script after printing help
}

while getopts "n:g:m:b:p:z:u:s:h" opt; do
  case "$opt" in
  n) VM_NAME="$OPTARG" ;;
  g) GIT_TOKEN="$OPTARG" ;;
  m) GIT_USER_EMAIL="$OPTARG" ;;
  b) GIT_BRANCH="$OPTARG" ;;
  p) GCP_PROJECT="$OPTARG" ;;
  z) GCP_ZONE="$OPTARG" ;;
  u) OPEN_FILES_LIMIT="$OPTARG" ;;
  s) SCENARIO_NAME="$OPTARG" ;;
  h) help ;;
  *) help ;;
  esac
done

if [ -z "$GIT_TOKEN" ]
then
   echo "The option -g (Github token) is required ";
   help
fi
if [ -z "$GIT_USER_EMAIL" ]
then
   echo "The option -m (Github user email) is required ";
   help
fi
if [ -z "$VM_NAME" ]
then
   echo "The option -n (name of the virtual machine) is required ";
   help
fi
if [ -z "$SCENARIO_NAME" ]
then
   echo "The option -s (load test scenario name) is required. Check '../load-test/README.md' for the existing scenario names.";
   help
fi

gcloud config set project $GCP_PROJECT

gcloud compute ssh $VM_NAME --zone $GCP_ZONE --project "$GCP_PROJECT" --command="bash -s" <<EOF
cd ~
if [ ! -d "commercetools-api-load-testing" ]; then
  git clone https://$GIT_TOKEN@github.com/flxlisboa/commercetools-api-load-testing.git
fi

cd commercetools-api-load-testing/

var="`(git show-branch remotes/origin/$GIT_BRANCH)`"
if [ $? -eq 0 ]; then
    git checkout -f $GIT_BRANCH
    git reset --hard
    git pull
else
    echo 'branch does not exists!'
    exit 1
fi

exit
EOF

gcloud compute scp --recurse ../load-tests/set-envs.sh ../load-tests/configs  $VM_NAME:~/commercetools-api-load-testing/load-tests --zone=$GCP_ZONE

gcloud compute ssh $VM_NAME --zone $GCP_ZONE --project "$GCP_PROJECT" --command="bash -s" <<EOF

ulimit -n $OPEN_FILES_LIMIT

cd ~
cd commercetools-api-load-testing/load-tests

./run-tests.sh $SCENARIO_NAME

git config user.email $GIT_USER_EMAIL
git config user.name $GIT_USER_EMAIL

cd ..
git add results
#git stash push -- results
#git checkout -f test-results
#git pull
#git stash pop
git commit -m "Load testing results committed."
git push origin master
EOF

echo "You can now check the results in github repository https://github.com/commercetools/commercetools-api-load-testing/tree/test-results"
