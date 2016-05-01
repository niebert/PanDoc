pandoc -S --bibliography ..\..\bib\data\biblio.bib -f markdown+simple_tables+footnotes -t beamer -o readme_beamer.pdf readme.md --csl ..\..\bib\csl\default.csl
