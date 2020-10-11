// var { ec2 } = new AWS.EC2({ region: "eu-west-1", endpoint: 'http://localhost:1234' });
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const assert = require('assert')

const ec2client = new EC2Client({
  endpoint: 'http://localhost:1234'
});

const DELTA = 7

const handler = async function(event, context) {
  try {
    const instances = await getStoppedInstances();
    await startInstances(instances);
  } catch (err) {
    console.error(err);
    return false;
  }
};

const filterOutStoppedForMoreThanDelta = (reservations) => {
  const now = new Date();

  return reservations.filter(reservation => {
    let stoppedAt = new Date(reservation.Instances[0].StateTransitionReason.match(/(\S{10}\s\S{8}\s\S{3})/gm)[0]);
    return Math.floor((Date.UTC(stoppedAt.getFullYear(), stoppedAt.getMonth(), stoppedAt.getDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() ) /(1000 * 60 * 60 * 24))) >= DELTA
  })
}

const getStoppedInstances = async () => {
  var params = {
    Filters: [
      {
        Name: "tag-key", 
        Values: [
          'service'
        ]
      },
      {
        Name: "instance-state-name",
        Values: [
          'stopped'
        ]
      }
    ]
  };

  try {
    let { Reservations: reservations } = await ec2client.send(new DescribeInstancesCommand(params));
    reservations = filterOutStoppedForMoreThanDelta(reservations) 
    assert.notStrictEqual(reservations.length, 0, 'No Instances to manage today.')
    return reservations
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

const startInstances = async (instances) => {
  throw new Error('Not implemented yet')
}

handler({}, {});