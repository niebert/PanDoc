pandoc -s -S --toc -c pandoc.css --bibliography ..\..\bib\data\biblio.bib -f markdown+simple_tables+footnotes -o readme.html readme.md --csl ..\..\bib\csl\default.csl
