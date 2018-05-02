function minedBlocks(lastn) {
  blocks = [];
  limit = eth.blockNumber - lastn
  for (i = eth.blockNumber; i >= limit; i--) {
     blocks.push({blockNumber: i, miner: eth.getBlock(i).miner})
  }
  return blocks
}

function count(lastn) {
  limit = eth.blockNumber - lastn
  var counts = [];
  var numOfMiners = 3;
  for (i = eth.blockNumber; i >= limit; i--) {
     var found = false;
     for (j = 0; j < numOfMiners; j++) {
     	if (counts[j] && eth.getBlock(i).miner === counts[j].miner) {
	   counts[j].count ++;
	   found = true;
     	}
     }
     if (!found) {
	counts.push({miner: eth.getBlock(i).miner, count: 1});
     }
  }
  return counts;
}

function getDifficulty(lastn) {
  blocks = [];
  limit = eth.blockNumber - lastn
  for (i = eth.blockNumber; i >= limit; i--) {

     blocks.push({block: i, difficulty: eth.getBlock(i).difficulty, miner: eth.getBlock(i).miner})
  }
  return blocks;
}

minedBlocks(100);
count(100);
getDifficulty(100);
