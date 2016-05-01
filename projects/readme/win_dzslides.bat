pandoc -s --mathml -i -t dzslides --bibliography ..\..\bib\data\biblio.bib -f markdown+simple_tables+footnotes -o readme_dzslides.html readme.md --csl ..\..\bib\csl\default.csl
