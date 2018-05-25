import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

bar_width = 5

# Choose the height of the error bars (bars1)

dfx = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/fairness/fairness_poet.csv')

fig, ax = plt.subplots(figsize=(7,5))

print dfx
miner1 =['0/0/count','1/0/count','2/0/count','3/0/count','4/0/count','5/0/count','6/0/count','7/0/count','8/0/count','9/0/count','10/0/count','11/0/count','12/0/count','13/0/count','14/0/count','15/0/count','16/0/count','17/0/count','18/0/count','19/0/count','20/0/count','21/0/count','22/0/count','23/0/count','24/0/count','25/0/count','26/0/count','27/0/count','28/0/count','29/0/count']
miner2 =['0/1/count','1/1/count','2/1/count','3/1/count','4/1/count','5/1/count','6/1/count','7/1/count','8/1/count','9/1/count','10/1/count','11/1/count','12/1/count','13/1/count','14/1/count','15/1/count','16/1/count','17/1/count','18/1/count','19/1/count','20/1/count','21/1/count','22/1/count','23/1/count','24/1/count','25/1/count','26/1/count','27/1/count','28/1/count','29/1/count']
miner3 =['0/2/count','1/2/count','2/2/count','3/2/count','4/2/count','5/2/count','6/2/count','7/2/count','8/2/count','9/2/count','10/2/count','11/2/count','12/2/count','13/2/count','14/2/count','15/2/count','16/2/count','17/2/count','18/2/count','19/2/count','20/2/count','21/2/count','22/2/count','23/2/count','24/2/count','25/2/count','26/2/count','27/2/count','28/2/count','29/2/count']
dfx['avg1']=dfx[miner1].mean(axis=1) / dfx['index']
dfx['avg2']=dfx[miner2].mean(axis=1) / dfx['index']
dfx['avg3']=dfx[miner3].mean(axis=1) / dfx['index']

dfx['std1']=1.96 * (dfx[miner1].std(axis=1) / dfx['index']) / np.sqrt(30)
dfx['std2']=1.96 * (dfx[miner2].std(axis=1) / dfx['index']) / np.sqrt(30)
dfx['std3']=1.96 * (dfx[miner3].std(axis=1) / dfx['index']) / np.sqrt(30)

ax.bar(dfx['index'] - bar_width, dfx['avg1'], bar_width, label= 'Node 1', yerr=dfx['std1'], capsize=7);
ax.bar(dfx['index'], dfx['avg2'], bar_width, label= 'Node 2', yerr=dfx['std2'], capsize=7);
ax.bar(dfx['index'] + bar_width , dfx['avg3'], bar_width, label= 'Node 3', yerr=dfx['std3'], color= 'gray',capsize=7);

ax.yaxis.grid(linestyle=':',linewidth=1.5)

# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

plt.tick_params(axis='both', which='major', labelsize=14)
ax.legend(loc=1,prop={'size': 14})

ax.set_ylim(ymin=0,ymax=1)
plt.xlabel('# blocks', fontsize=14)
plt.ylabel('average fraction of mined blocks ' + '$B_m$', fontsize=14)
ax.set_axisbelow(True)
plt.savefig('ev_fairness_poet.png')
plt.show();


