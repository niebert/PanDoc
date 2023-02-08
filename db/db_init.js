vDataJSON.db['initdb'] = {
    "castype": "maxima",
    "commands": [
        {
            "cmdtitle": "Set Constant to 100!",
            "cmd": "c1:=12!",
            "result4cmd": "c1:=479001600"
        },
        {
            "cmdtitle": "Define Function f(x):=x^2",
            "cmd": "f(x):=x^2",
            "result4cmd": "f(x):=x^2"
        },
        {
            "cmdtitle": "Evaluate Function f(4)",
            "cmd": "f(4)",
            "result4cmd": "f(4)"
        },
        {
            "cmdtitle": "Plot2D f(x)",
            "cmd": "f(x):=x^2-1\nplot2d(f(x),x[-5,5])",
            "result4cmd": "PLOT2D f(x)"
        },
        {
            "cmdtitle": "Plot2D h(x)",
            "cmd": "h(x):=10*sin(x)\nplot2d(h(x),x[-5,5])",
            "result4cmd": "PLOT2D h(x)"
        },
        {
            "cmdtitle": "Plot2D f(x),h(x)",
            "cmd": "plot2d(f(x),h(x),x[-5,5])",
            "result4cmd": "PLOT2D"
        },
        {
            "cmdtitle": "Define Function g(x,y)",
            "cmd": "g(x,y):=cos(x)+sin(y)",
            "result4cmd": "g(x,y):=cos(x)+sin(y)"
        },
        {
            "cmdtitle": "Plot3D g(x,y)",
            "cmd": "plot3d(g(x,y),x[-5,5],y[-4,6])",
            "result4cmd": "PLOT3D"
        },
        {
            "cmdtitle": "Plot2D - Spiral",
            "cmd": "curve2d([t*cos(t),t*sin(t)],t[0,16],color[green],linewidth[3])",
            "result4cmd": "CURVE2D"
        },
        {
            "cmdtitle": "Convex Combination Ord3 - K(t)",
            "cmd": "curve3d(K(t),t[0,1],color[blue],linewidth[10])",
            "result4cmd": "curve3d: K(t)=[3,4,5]* (1-t)^3 +[5,4,-3]*3*(1-t)^2*t+ [-6,-6,6]*3*(1-t)*t^2 +[-3,-7,0]*t^3   \\quad "
        },
        {
            "cmdtitle": "Plot3D double helix",
            "cmd": "curve3d([cos(t),sin(t),t],[sin(t),cos(t),t],t[0,15],color[#78AC54])",
            "result4cmd": "PLOT3D"
        },
        {
            "cmdtitle": "Evaluate Function g(3,4)",
            "cmd": "g(3,4)",
            "result4cmd": "\\mbox{expand to }3^2+4^2 \\mbox{ compute solution.}"
        },
        {
            "cmdtitle": "Expand nested Function g(f(5),b)",
            "cmd": "g(f(5),b)",
            "result4cmd": "\\mbox{expand to }5^2\\mbox{ compute solution.}"
        },
        {
            "cmdtitle": "Plot plot3d(g(x,y)",
            "cmd": "plot3d(g(x,y),x[-5,5],y[-3,8])",
            "result4cmd": "PLOT3D"
        },
        {
            "cmdtitle": "Sum of two integer",
            "cmd": "3+4*5",
            "result4cmd": ""
        },
        {
            "cmdtitle": "Symbolic Caluculation x+x",
            "cmd": "x+x",
            "result4cmd": "2 cdot x"
        },
        {
            "cmdtitle": "Faculty 11! with comments",
            "cmd": "11! # gets long after 50000!",
            "result4cmd": ""
        },
        {
            "cmdtitle": "factorize 100!",
            "cmd": "factor(100!)",
            "result4cmd": ""
        },
        {
            "cmdtitle": "Fraction Calculations",
            "cmd": "13579/99999 + 13580/100000\nnumerator(1/a+1/b)\ndenominator(1/(x-1)/(x-2))\nrationalize(a/b+b/a)",
            "result4cmd": ""
        },
        {
            "cmdtitle": "Calculation complex functions",
            "cmd": "A=1+i\nB=sqrt(2)*exp(i*pi/8)\nA-B\nrect",
            "result4cmd": ""
        },
        {
            "cmdtitle": "simplify functions",
            "cmd": "simplify(cos(x)^2 + sin(x)^2)\nsimplify(a*b+a*c)\nsimplify(n!/(n+1)!)",
            "result4cmd": ""
        },
        {
            "cmdtitle": "expand (x-1)*(x-2)",
            "cmd": "(x-1)*(x-2)^3",
            "result4cmd": ""
        },
        {
            "cmdtitle": "solve equations",
            "cmd": "roots(3 x + 12 + y = 24) # first degree (in x)\nroots(a*x^2+b*x+c) # second degree",
            "result4cmd": ""
        },
        {
            "cmdtitle": "Roots of Polnomials",
            "cmd": "nroots(x^16+x^15+2)",
            "result4cmd": ""
        },
        {
            "cmdtitle": "# Define a Tensor",
            "cmd": "# Define a tensor function\nF=[x+2y,3x+4y]\n# now the gradient\nd(F,[x,y])",
            "result4cmd": ""
        },
        {
            "cmdtitle": "Gradients and derivatives",
            "cmd": "d(x^2)\nr(x,y):=sqrt(x^2+y^2)\nd(r(x,y),[x,y])",
            "result4cmd": ""
        },
        {
            "cmdtitle": "Integrals",
            "cmd": "integral(x^2)\nintegral(x*y,x,y)",
            "result4cmd": ""
        },
        {
            "cmdtitle": "Integrals with limits",
            "cmd": "# compute integrals\ndefint(x^2,y,0,sqrt(1-x^2),x,-1,1)",
            "result4cmd": ""
        },
        {
            "cmdtitle": "Calculations in exponential domain",
            "cmd": "#calculating in an exponential domain\nf_1=sin(t)^4-2*cos(t/2)^3*sin(t)\nf_1=circexp(f_1)\ndefint(f_1,t,0,2*pi)",
            "result4cmd": ""
        }
    ],
    "casfunctions": [
        {
            "name": "g",
            "args": "x,y",
            "def": "x^3+y^2"
        },
        {
            "name": "f",
            "args": "x",
            "def": "x^5"
        },
        {
            "name": "h",
            "args": "x",
            "def": "10*sin(x)"
        },
        {
            "name": "cur",
            "args": "t",
            "def": "[cos(t),sin(t),t]"
        },
        {
            "name": "K",
            "args": "t",
            "def": "v1* (1-t)^3 +v2*3*(1-t)^2*t+ v3*3*(1-t)*t^2 +v4*t^3"
        }
    ],
    "casvariables": [
        {
            "name": "c1",
            "def": "12!"
        },
        {
            "name": "c2",
            "def": "23^5-4+sin(13)"
        },
        {
            "name": "c3",
            "def": "f1(x)"
        },
        {
            "name": "v1",
            "def": "[3,4,5]"
        },
        {
            "name": "v2",
            "def": "[5,4,-3]"
        },
        {
            "name": "v3",
            "def": "[-6,-6,6]"
        },
        {
            "name": "v4",
            "def": "[-3,-7,0]"
        }
    ]
};
