var mining_threads = 1;
var txBlock = 0;
var timeout;
var timeout_set;
var beginTime;
var times = [];

function simulatePoET() {
    if (eth.getBlock("pending").transactions.length > 0) {
        if (timeout_set || eth.mining) return;
        txBlock = eth.getBlock("pending").number;
        timeout = setTimeout(startMining, getRandomInt(1000,10000)); // from 1s to 10s
    }
    else {
        miner.stop()
    }
}

function startMining() {
    console.log("-- txBlock", txBlock);
    console.log("-- eth.getBlock(pending).number", eth.getBlock("pending").number);
    if (txBlock === eth.getBlock("pending").number) {
        if (eth.mining) return;
        console.log("Mining starts");
        miner.start(mining_threads);
        while (eth.getBlock("latest").number < txBlock) {
            //to wait until it has been mined
        }
        miner.stop();
        timeout_set = false;
    }
}

function pow() {
    if (eth.getBlock("pending").transactions.length > 0) {
        txBlock = eth.getBlock("pending").number
        if (eth.mining) return;
        console.log("  Transactions pending. Mining...");
        miner.start(mining_threads)
        while (eth.getBlock("latest").number < txBlock) {
            //to wait until it has been mined
        }
        miner.stop()
    }
    else {
        miner.stop()
    }
}


function getRandomInt(min, max) {
    var time = Math.floor(Math.random() * (max - min)) + min;
    console.log("-- time", time);
    timeout_set = true;
    return time; //The maximum is exclusive and the minimum is inclusive
}

function getMiningTime(From,To, interval) {
    var times = [];
    var runs = (To - From)/ interval;
    for (i = 0; i < runs; i ++) {
        var j = From + i * interval;
        var k = j + interval;
        var timeTo = new Date(eth.getBlock(k).timestamp*1000);
        var timeFrom = new Date(eth.getBlock(j).timestamp*1000);
        var timeInSec = (timeTo-timeFrom) / 1000;
        times.push({time: timeInSec / interval})
    }
    return times;
}


function countEach(From, to) {
    var counts = [];
    var numOfMiners = 3;
        for (t = 1; t <= 18; t++) {
            for (i = 1; i <= 10; i++) {
                from = t * 100 - 100 + From;
                to = t * 100 + From;
                subTo = 10 * i;
                for (k = from; k < from + subTo; k++) {
                    var found = false;
                    console.log(k)
                    console.log(i)
                    for (j = 0; j < numOfMiners; j++) {
                        if (counts[i] && counts[i][t-1] && counts[i][t-1][j] && eth.getBlock(k).miner === counts[i][t-1][j].miner) {
                            counts[i][t-1][j].count++;
                            found = true;
                        }
                    }
                    if (!found) {
                        if (counts[i]) {
                            if (counts[i][t-1]) {
                                counts[i][t-1].push({miner: eth.getBlock(k).miner, count: 1});
                            }
                            else {
                                counts[i][t-1] = [{miner: eth.getBlock(k).miner, count: 1}];
                            }
                        }
                        else {
                            counts[i] = [[{miner: eth.getBlock(k).miner, count: 1}]];
                        }
                    }
                }
            }
        }
    return counts;
}

eth.filter("latest", function(err, block) {
    if (eth.getBlock("latest").miner !== eth.coinbase ) {
        timeout_set = false;
        clearTimeout(timeout);
    }

    simulatePoET();
    //pow();
});

eth.filter("pending", function(err, block) {
    simulatePoET();
    //getpow();
})

