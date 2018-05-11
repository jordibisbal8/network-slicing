import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

data1 = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/pricing/price3_1.csv')
data2 = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/pricing/price3_2.csv')

df1 = data1[['A1', 'A2','A3','A4', 'A5']]
df2 = data2[['A1', 'A2','A3','A4', 'A5']]

meanL1 =[ df1['A1'].mean(), df1['A2'].mean(),df1['A3'].mean(),df1['A4'].mean(),df1['A5'].mean()]
stdL1 =[  1.96 * df1['A1'].std()/ np.sqrt(100),  1.96 * df1['A2'].std()/ np.sqrt(100),  1.96 * df1['A3'].std()/ np.sqrt(100),  1.96 *df1['A4'].std()/ np.sqrt(100),  1.96 * df1['A5'].std()/ np.sqrt(100)]
meanL2 =[ df2['A1'].mean(), df2['A2'].mean(),df2['A3'].mean(),df2['A4'].mean(),df2['A5'].mean()]
stdL2 =[  1.96 * df2['A1'].std()/np.sqrt(100), 1.96 * df2['A2'].std()/np.sqrt(100), 1.96 * df2['A3'].std()/ np.sqrt(100), 1.96 * df2['A4'].std()/ np.sqrt(100), 1.96 * df2['A5'].std()/ np.sqrt(100)]

index=[1,2,3,4,5]

ax = plt.subplot()
ax.errorbar(index, meanL1, stdL1, fmt='-', label="L1")
ax.errorbar(index, meanL2, stdL2, color="r", fmt='-', label="L2")



plt.xlabel('arrival rate ' +'$\lambda$')
plt.ylabel('hourly cost E[' + r'$\alpha^{h}_{s^{*}}(N^R)$]')
plt.grid(linestyle=':',linewidth=1.5)

# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

ax.set_xlim(xmin=1, xmax=5.01)
ax.set_ylim(ymin=0, ymax=100)
ax.legend(loc=4)
plt.xticks(index)

plt.savefig('ev_pricing.png')
plt.show()
