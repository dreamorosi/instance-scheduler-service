var AWS = require("aws-sdk");
var ec2 = new AWS.EC2({ region: "eu-west-1" });

const SERVICE_TAG_START = "service:start";
const SERVICE_TAG_STOP = "service:stop";
const SERVICE_TAGS = [SERVICE_TAG_START, SERVICE_TAG_STOP];

const handler = async function(event, context) {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  try {
    const instanceList = await retrieveInstancesList();
    const cleanedInstanceList = await retrieveInstancesIdAndServiceTags(
      instanceList
    );
    await startOrStopInstances(cleanedInstanceList, hours, minutes);
  } catch (err) {
    console.error(err);
    return false;
  }
};

const retrieveInstancesList = () =>
  new Promise((resolve, reject) => {
    ec2.describeInstances({}, (err, data) => {
      if (err) reject(err);
      var fs = require("fs");
      fs.writeFile("myjsonfile.json", JSON.stringify(data), "utf8", () => {});
      const { Reservations: reservations } = data;
      if (!reservations || !reservations.length) {
        reject("No Reservations found, aborting.");
      }
      const [{ Instances: instances }] = reservations;
      if (!instances.length) {
        reject("No Instances found, aborting.");
      }
      resolve(instances);
    });
  });

const retrieveInstancesIdAndServiceTags = instanceList =>
  new Promise((resolve, reject) => {
    const cleanedInstanceList = new Array();
    instanceList.forEach(instance => {
      const { InstanceId: instanceId, Tags: tags } = instance;
      if (!instanceId || !tags.length) {
        return;
      }
      const serviceTags = new Array();
      tags.forEach(tag => {
        const { Key: key } = tag;
        if (!SERVICE_TAGS.includes(key)) {
          return;
        }
        serviceTags.push(tag);
      });
      if (!tags.length) {
        return;
      }
      cleanedInstanceList.push({
        instanceId: instanceId,
        tags: serviceTags
      });
    });
    if (!cleanedInstanceList.length) {
      reject("No Instances to be managed, aborting.");
    }
    resolve(cleanedInstanceList);
  });

const startOrStopInstances = (instanceList, hours, minutes) =>
  new Promise((resolve, reject) => {
    instanceList.forEach(instance => {
      instance.tags.forEach(async tag => {
        const { Key: key, Value: val } = tag;
        if (SERVICE_TAG_START.includes(key)) {
          await startInstance(instance.instanceId);
        } else {
          await stopInstance(instance.instanceId);
        }
      });
    });
  });

const startInstance = instanceId => console.log(`Should start ${instanceId}`);

const stopInstance = instanceId => console.log(`Should stop ${instanceId}`);

handler({}, {});
