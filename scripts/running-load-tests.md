# Deployment guide

Running a load test has some hardware considerations which requires higher network throughput, more available memory, CPU cores and higher range of available outgoing ports.
This document provides detailed steps on GCP environment creation and execution of the load test scenarios.

## How it works

- [Prerequisites](#prerequisites): Check prerequisites before you begin the steps
- [Step 1](#step-1-create-a-new-vm-instance): Creating a new VM instance on GCP from scratch
- [Step 2](#step-2-execute-load-test-inside-the-vm-instance): Executing the load test scenarios inside the VM instance
- [Step 3](#step-3-delete-the-vm-instance): Deleting the VM instance

### Prerequisites

- In case Google cloud SDK is not installed yet:

  - Install gcloud sdk. Run the following script:
    ```bash
       ./install_gcloud_sdk.sh
    ```
  - To obtain access credentials for your user account, run:
    ```bash
       gcloud auth login
    ```

- You should create a personal Github access token in order to clone the load-test branch/repository inside the VM.
  - Direct link: [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)
    - Select the repo scope from the checkbox.
    - Then click `Generate token` button and make sure to copy your new personal access token as you will need in the below steps.

## Step 1: Create a new VM instance

In this section we will create a new GCP VM instance with the help of the script from scratch. The creation process
also involves the setup of the load test environment and installation of the various testing components like k6.

### Script ([**create_gcp_vm.sh**](create_gcp_vm.sh))

```bash
./create_gcp_vm -n <vm-name> -p <project-id> -z <zone> -m <machine-type> -h
```

| Argument | Description                                                     | Required | Default value            |
| -------- | :-------------------------------------------------------------- | :------- | :----------------------- |
| -n       | A user defined name for the VM instance (e.g load-test-machine) | true     | -                        |
| -p       | Your Google Cloud Platform project ID.                          | false    | professionalserviceslabs |
| -z       | Zone of the instance to create.                                 | false    | europe-west3-c           |
| -m       | Specifies the machine type used for the instances.              | false    | e2-standard-16           |
| -h       | Display help.                                                   | false    | -                        |

## Step 2: Execute load test inside the VM instance

In this step, we will describe how to execute load test scenarios:

### Script ([**execute_tests_in_vm.sh**](execute_tests_in_vm.sh))

Detailed steps of the script:

1. Clones or pulls load test repository inside the created VM instance(Ensure you provide only k6 related branch for the parameter '-b').
2. Set the Ulimit(Open files limit) in the VM instance to account for additional non-network file usage while running load tests.
3. Execute the k6 load tests.
4. Commits the load test results to the the [test-results](https://github.com/commercetools/commercetools-api-load-testing/tree/test-results) branch with file (e.g: `results/project-key/scenario-name_2021-05-28_09-08-04.txt`).

```bash
./execute_tests_in_vm.sh -n <vm-name> -g <github-token> -m <github-user-email> -s <scenario-name> -b <github-branch> -p <project> -z <zone> -u <open-files-limit> -h
```

| Argument | Description                                               | Required | Default value            |
| -------- | :-------------------------------------------------------- | :------- | :----------------------- |
| -n       | The name of VM instance                                   | true     | -                        |
| -g       | Your github access token value.                           | true     | -                        |
| -m       | Your github user email.                                   | true     | -                        |
| -s       | Load test scenario name to run                            | true     | -                        |
| -b       | Your github branch.                                       | false    | main                     |
| -p       | Your Google Cloud Platform project ID.                    | false    | professionalserviceslabs |
| -z       | Zone of the VM instance.                                  | false    | europe-west3-c           |
| -u       | Open files limit(ulimit) value to set in the VM instance. | false    | 250000                   |
| -h       | Display help.                                             | false    | -                        |

### Step 3: Delete the VM instance

In this step, we will describe how to delete the VM instance from the cloud project.

### Script ([**delete_gcp_vm.sh**](delete_gcp_vm.sh))

```bash
./delete_gcp_vm.sh -n <vm-name> -p <project-id> -z <zone>
```

| Argument | Description                            | Required | Default value            |
| -------- | :------------------------------------- | :------- | :----------------------- |
| -n       | The name of VM instance                | true     | -                        |
| -p       | Your Google Cloud Platform project ID. | false    | professionalserviceslabs |
| -z       | Zone of the VM instance.               | false    | europe-west3-c           |
| -h       | Display help.                          | false    | -                        |
