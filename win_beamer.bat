pandoc -S --bibliography .\bib\data\biblio.bib -f markdown+simple_tables+footnotes -t beamer -o .\projects\readme\readme_beamer.pdf .\projects\readme\readme.md --csl .\bib\csl\apa5.csl
