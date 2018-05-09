import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

bar_width = 0.25

# Choose the height of the error bars (bars1)

dfx = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/winner/winner1.csv')

fig, ax = plt.subplots(figsize=(7,5))

mean1 = [dfx['I11'].mean(),dfx['I12'].mean(),dfx['I13'].mean(),dfx['I14'].mean(),dfx['I15'].mean()]
mean2 = [dfx['I21'].mean(),dfx['I22'].mean(),dfx['I23'].mean(),dfx['I24'].mean(),dfx['I25'].mean()]
mean3 = [dfx['I31'].mean(),dfx['I32'].mean(),dfx['I33'].mean(),dfx['I34'].mean(),dfx['I35'].mean()]

std1 = [dfx['I11'].std(),dfx['I12'].std(),dfx['I13'].std(),dfx['I14'].std(),dfx['I15'].std()]
std2 = [dfx['I21'].std(),dfx['I22'].std(),dfx['I23'].std(),dfx['I24'].std(),dfx['I25'].std()]
std3 = [dfx['I31'].std(),dfx['I32'].std(),dfx['I33'].std(),dfx['I34'].std(),dfx['I35'].std()]

index = dfx[dfx['arrivals'].notnull()]['arrivals']
print dfx['I11'].std()
ax.bar(index - bar_width, mean1, bar_width, label= 'InP1', yerr=std1, capsize=7);
ax.bar(index, mean2, bar_width, label= 'InP2', yerr=std2, capsize=7);
ax.bar(index + bar_width , mean3, bar_width, label= 'InP3', yerr=std3, color= 'gray',capsize=7);

ax.yaxis.grid(linestyle=':',linewidth=1.5)

# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

ax.set_ylim(ymin=0,ymax=1.2)
ax.set_xlim(xmin=0,xmax=5.35)
plt.xlabel('arrival rate ' +'$\lambda$')
plt.ylabel('% VNR')
ax.set_axisbelow(True)
ax.legend(loc=1)
plt.savefig('ev_winners_L1.png')
plt.show();


