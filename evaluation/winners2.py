import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

bar_width = 0.25

# Choose the height of the error bars (bars1)

dfx = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/winner/winner2.csv')

fig, ax = plt.subplots(figsize=(7,5))

mean1 = [dfx['I11'].mean(),dfx['I12'].mean(),dfx['I13'].mean(),dfx['I14'].mean(),dfx['I15'].mean()]
mean2 = [dfx['I21'].mean(),dfx['I22'].mean(),dfx['I23'].mean(),dfx['I24'].mean(),dfx['I25'].mean()]
mean3 = [dfx['I31'].mean(),dfx['I32'].mean(),dfx['I33'].mean(),dfx['I34'].mean(),dfx['I35'].mean()]

std1 = [1.96 * dfx['I11'].std()/np.sqrt(100), 1.96 * dfx['I12'].std()/np.sqrt(100), 1.96 * dfx['I13'].std()/np.sqrt(100),1.96 * dfx['I14'].std()/np.sqrt(100),1.96 * dfx['I15'].std()/np.sqrt(100)]
std2 = [1.96 * dfx['I21'].std()/np.sqrt(100),1.96 *dfx['I22'].std()/np.sqrt(100),1.96 *dfx['I23'].std()/np.sqrt(100),1.96 *dfx['I24'].std()/np.sqrt(100),1.96 *dfx['I25'].std()/np.sqrt(100)]
std3 = [1.96 * dfx['I31'].std()/np.sqrt(100),1.96 *dfx['I32'].std()/np.sqrt(100),1.96 *dfx['I33'].std()/np.sqrt(100),1.96 *dfx['I34'].std()/np.sqrt(100),1.96 *dfx['I35'].std()/np.sqrt(100)]


index = dfx[dfx['arrivals'].notnull()]['arrivals']
print dfx['I11'].std()
ax.bar(index - bar_width, mean1, bar_width, label= 'Infrastructure Provider $InP_1$', yerr=std1, capsize=7);
ax.bar(index, mean2, bar_width, label= 'Infrastructure Provider $InP_2$', yerr=std2, capsize=7);
ax.bar(index + bar_width , mean3, bar_width, label= 'Infrastructure Provider $InP_3$', yerr=std3, color= 'gray',capsize=7);

ax.yaxis.grid(linestyle=':',linewidth=1.5)

# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

plt.tick_params(axis='both', which='major', labelsize=14)
ax.legend(loc=1,prop={'size': 14})

ax.set_ylim(ymin=0,ymax=1)
ax.set_xlim(xmin=0,xmax=5.35)
plt.xlabel('request arrival rate ' +'$\lambda$', fontsize=14)
plt.ylabel('average fraction of requests assigned to $InP_x$', fontsize=14)
ax.set_axisbelow(True)
plt.savefig('ev_winners_L2.png')
plt.show();


