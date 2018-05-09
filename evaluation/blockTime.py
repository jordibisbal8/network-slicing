import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

medianprops = dict(color="r")
whiskerprops = dict(linestyle='--')

df = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/blockTime/blockTime.csv')

dfx=df[['InP1', 'InP2','InP3','InP4','InP5']]

data = [dfx['InP1'], dfx['InP2'], dfx['InP3'] ,dfx['InP4'], dfx['InP5']]

fig, ax = plt.subplots(figsize=(7,5))
ax.boxplot(data, 0, '', medianprops=medianprops,whiskerprops=whiskerprops)

ax.yaxis.grid(linestyle=':',linewidth=1.5)
ax.set_xlim(xmin=0)
ax.set_ylim(ymin=0, ymax=10)
plt.xlabel('# InPs')
plt.ylabel('block time ' + 'E[' + r'$t_b]$')

plt.savefig('ev_block_time.png')
plt.show();
