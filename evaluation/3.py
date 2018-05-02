import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


n_groups = 5
index = np.arange(n_groups)
data1 = (60, 50, 40, 37.3, 35.3)
data2 = (18, 27, 33, 33.7, 33.3)
data3 = (22, 23, 27, 30, 31.3)
bar_width = 0.2

# Choose the height of the error bars (bars1)

df = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/test.csv')

mean = df['price'].mean()
std = df['price'].std()
print mean
print 2*std

# Choose the height of the error bars (bars2)
yer2 = [1, 0.7, 1, 20, 0.9]

fig, ax = plt.subplots(figsize=(7,5))
ax.bar(index, data1, bar_width, label= 'Node 1',yerr=2*std, capsize=7);
ax.bar(index + bar_width, data2, bar_width, label= 'Node 2', yerr=2*std, capsize=7);
ax.bar(index + bar_width * 2 , data3, bar_width, label= 'Node 3', color= 'gray');
ax.set_xticks(index + bar_width )
ax.set_xticklabels(('10', '20', '30', '40', '50'))

ax.yaxis.grid(linestyle=':',linewidth=1.5)

# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

ax.set_ylim(ymin=0,ymax=100)
plt.xlabel('# blocks')
plt.ylabel('% mined blocks')
ax.set_axisbelow(True)
ax.legend()
plt.show();

