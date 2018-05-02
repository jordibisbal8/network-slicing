import matplotlib.pyplot as plt
import numpy as np

#Price depending on lifetime

t1 = np.arange(0.0, 100, 10)

ax = plt.subplot()
ax.plot(t1, t1, 'b')

plt.xlabel('# blocks')
plt.ylabel('# forks')
plt.grid(linestyle=':',linewidth=1.5)

x = np.arange(1, 100)
y = x + 15*x
print x
print y
plt.scatter(x, y, color="b", alpha=0.5)
y = x -5
plt.scatter(x, y, color="b", alpha=0.5)
y = x + 3
plt.scatter(x, y, color="b", alpha=0.5)

# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

ax.set_xlim(xmin=0, xmax=100)
ax.set_ylim(ymin=0, ymax=100)

plt.show()
