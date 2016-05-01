pandoc -S --reference-odt .\tpl\odt\tpldefault.odt --bibliography .\bib\data\biblio.bib -f markdown+simple_tables+footnotes -t odt -o --csl .\bib\csl\default.csl
