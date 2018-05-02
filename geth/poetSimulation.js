var mining_threads = 1;
var txBlock = 0;
var timeout;
var timeout_set;

function simulatePoET() {
    if (eth.getBlock("pending").transactions.length > 0) {
        if (timeout_set || eth.mining) return;
        txBlock = eth.getBlock("pending").number;
        timeout = setTimeout(startMining, getRandomInt(1000,5000)); // from 1s to 10s
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
        while (eth.getBlock("latest").number < txBlock + 3) {
            if (eth.getBlock("pending").transactions.length > 0) txBlock = eth.getBlock("pending").number;
        }
        console.log("  3 confirmations achieved; mining stopped.");
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

eth.filter("latest", function(err, block) {
    if (eth.getBlock("latest").miner !== eth.coinbase ) {
        timeout_set = false;
        clearTimeout(timeout);
    }
    simulatePoET();
});

eth.filter("pending", function(err, block) {
    simulatePoET();
    //pow();
})

