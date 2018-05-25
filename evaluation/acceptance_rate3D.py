from mpl_toolkits.mplot3d import Axes3D
from matplotlib.ticker import LinearLocator
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

class MyAxes3D(Axes3D):

    def __init__(self, baseObject, sides_to_draw):
        self.__class__ = type(baseObject.__class__.__name__,
                              (self.__class__, baseObject.__class__),
                              {})
        self.__dict__ = baseObject.__dict__
        self.sides_to_draw = list(sides_to_draw)
        self.mouse_init()

    def set_some_features_visibility(self, visible):
        for t in self.w_zaxis.get_ticklines() + self.w_zaxis.get_ticklabels():
            t.set_visible(visible)
        self.w_zaxis.line.set_visible(visible)
        self.w_zaxis.pane.set_visible(visible)
        self.w_zaxis.label.set_visible(visible)

    def draw(self, renderer):
        # set visibility of some features False 
        self.set_some_features_visibility(False)
        # draw the axes
        super(MyAxes3D, self).draw(renderer)
        # set visibility of some features True. 
        # This could be adapted to set your features to desired visibility, 
        # e.g. storing the previous values and restoring the values
        self.set_some_features_visibility(True)

        zaxis = self.zaxis
        draw_grid_old = zaxis.axes._draw_grid
        # disable draw grid
        zaxis.axes._draw_grid = False

        tmp_planes = zaxis._PLANES

        if 'l' in self.sides_to_draw :
            # draw zaxis on the left side
            zaxis._PLANES = (tmp_planes[2], tmp_planes[3],
                             tmp_planes[0], tmp_planes[1],
                             tmp_planes[4], tmp_planes[5])
            zaxis.draw(renderer)
        if 'r' in self.sides_to_draw :
            # draw zaxis on the right side
            zaxis._PLANES = (tmp_planes[3], tmp_planes[2], 
                             tmp_planes[1], tmp_planes[0], 
                             tmp_planes[4], tmp_planes[5])
            zaxis.draw(renderer)

        zaxis._PLANES = tmp_planes

        # disable draw grid
        zaxis.axes._draw_grid = draw_grid_old

fig = plt.figure()
ax = fig.gca(projection='3d')

df3 = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/acceptanceRate/acceptanceRate3_1.csv')
df4 = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/acceptanceRate/acceptanceRate4_1.csv')
df5 = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/acceptanceRate/acceptanceRate5_1.csv')
df6 = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/acceptanceRate/acceptanceRate6_1.csv')
df7 = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/acceptanceRate/acceptanceRate7_1.csv')

y = np.array([3,4,5,6,7])
x, y = np.meshgrid(df3.index.values, y)

z = np.array([
 df3.mean(axis=1).values, df6.mean(axis=1).values, df4.mean(axis=1).values, df7.mean(axis=1).values,df5.mean(axis=1).values
])

fig.add_axes(MyAxes3D(ax, 'l'))
surf = ax.plot_surface(x, y, z)


# Customize the axis.
ax.set_zlim(0, 1)
ax.set_xlim(xmin=0,xmax=100)
ax.set_ylim(ymin=3,ymax=7)
ax.w_yaxis.set_major_locator(LinearLocator(5))
ax.set_xlabel('# VNR', fontsize=8)
ax.set_ylabel('# ' + '$I_p$', fontsize=8)
ax.set_zlabel('average acceptance rate E[' + r'$\varphi$]', fontsize=8)
plt.tick_params(axis='both', which='major', labelsize=8)
plt.savefig('ev_acceptance_rate3D.png')
plt.show()
