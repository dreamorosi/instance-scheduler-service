# :construction: Instance Scheduler Service

## TO DO:
* Remove region from code
* Write launch confs
* Try to query only InstanceId & Tags from AWS.describeInstances()
* Implement time (hours/minutes) parsing and matching 
* Implement start/stop behavior
* Write tests
* Write CDK template


```sh
docker run --name local_ec2 --rm -d -e SERVICES=ec2 -p 1234:4566 localstack/localstack

aws ec2 run-instances --image-id ami-03cf127a --tag-specifications "ResourceType=instance,Tags=[{Key=service,Value=start}]" --endpoint-url http://localhost:1234
```