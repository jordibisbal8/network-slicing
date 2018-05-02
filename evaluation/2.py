import matplotlib.pyplot as plt
import numpy as np

boxprops = dict(color='blue', facecolor='white')
medianprops = dict(linestyle=None,linewidth=0)
meanpointprops = dict(marker='o', markeredgecolor='b',markerfacecolor='black')
whiskerprops = dict(linestyle='--')

A= [[0.5], [1, 1.5, 2], [1, 2, 3] ,[1, 2.5, 4], [1, 3, 5], [1, 3.5, 5]]

fig, ax = plt.subplots(figsize=(7,5))
ax.boxplot(A,boxprops=boxprops, medianprops=medianprops, patch_artist=True, meanprops=meanpointprops,whiskerprops=whiskerprops, showmeans=True)

ax.yaxis.grid(linestyle=':',linewidth=1.5)
ax.set_xlim(xmin=0)
ax.set_ylim(ymin=0, ymax=13)
plt.xlabel('# InPs')
plt.ylabel('E[' + r'$t_b]$')

plt.show();
