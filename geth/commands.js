

function getMiningTime(from,to) {
    var timeTo = new Date(eth.getBlock(to).timestamp*1000);
    var timeFrom = new Date(eth.getBlock(from).timestamp*1000);
    return (timeTo-timeFrom) / 1000;
}

function count(from, to) {
  var counts = [];
  var numOfMiners = 3;
  for (i = from; i < to; i++) {
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
  
}

function countEach(from, to, each) {
  var counts = [];
  var numOfMiners = 3;
  for (i = 1; i <= 20; i++) {
     subTo = 5 * i;
     for (k = from; k < from + subTo; k++) {
        var found = false;
        for (j = 0; j < numOfMiners; j++) {
           if (counts[i] && counts[i][j] && eth.getBlock(k).miner === counts[i][j].miner) {
	      counts[i][j].count ++;
	      found = true;
     	   }
        }
        if (!found) {
	        if (counts[i]) {
	            counts[i].push({miner: eth.getBlock(k).miner, count: 1, i: i, k: k});
            }
	        else {
	            counts[i] = [({miner: eth.getBlock(k).miner, count: 1, i: i, k: k})];
	        }
        }
     }
  }
  return counts;
}




