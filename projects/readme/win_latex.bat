pandoc -N --template=..\..\tpl\latex\tpldefault.latex --bibliography ..\..\bib\data\biblio.bib -f markdown+simple_tables+footnotes --variable mainfont="Palatino" --variable monofont="Consolas" --variable fontsize=12pt --variable version=1.0 readme.md --latex-engine=xelatex --toc -o readme.tex