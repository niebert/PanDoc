---
title: 'Pandoc - Demos'
viewport: 'width=device-width, initial-scale=1.0'
...

<div id="doc" class="container-fluid">

<div id="flattr">

[](http://johnmacfarlane.net/pandoc){.FlattrButton}
[![Flattr
this](http://api.flattr.com/button/flattr-badge-large.png "Flattr this")](http://flattr.com/thing/936364/Pandoc)

</div>

<div id="paypal">

![](https://www.paypalobjects.com/en_US/i/scr/pixel.gif){width="1"
height="1"}

</div>

<span class="big">Pandoc</span>   <span class="small">a universal
document converter</span>
<div id="bd">

<div class="navbar-header">

<span class="sr-only">Toggle navigation</span> <span
class="icon-bar"></span> <span class="icon-bar"></span> <span
class="icon-bar"></span>

</div>

<div class="navbar-collapse collapse">

-   [About](index.html)
-   [Installing](installing.html)
-   [Getting started](getting-started.html)
-   [Demos](){.tree-toggle .nav-header}
    -   [Try pandoc online](try)
    -   [Examples](demos.html)
-   [Documentation](){.tree-toggle .nav-header}
    -   [User's Guide](){.tree-toggle .nav-header}
        -   [HTML](README.html)
        -   [PDF](README.pdf)
    -   [FAQ](faqs.html)
    -   [Press](press.html)
    -   [API documentation](http://hackage.haskell.org/package/pandoc)
    -   [Contributing](CONTRIBUTING.html)
    -   [Mailing lists](lists.html)
    -   [Scripting](scripting.html)
    -   [Making an ebook](epub.html)
-   [Extras](https://github.com/jgm/pandoc/wiki/Pandoc-Extras)
-   [Releases](releases.html)

</div>

<div id="toc">

-   [Try pandoc online](#try-pandoc-online)
-   [Examples](#examples)

</div>

<div class="row">

Try pandoc online
=================

You can try pandoc online [here](http://johnmacfarlane.net/pandoc/try).

Examples
========

To see the output created by each of the commands below, click on the
name of the output file:

1.  HTML fragment:

        pandoc README -o example1.html

2.  Standalone HTML file:

        pandoc -s README -o example2.html

3.  HTML with smart quotes, table of contents, CSS, and custom footer:

        pandoc -s -S --toc -c pandoc.css -A footer.html README -o example3.html

4.  LaTeX:

        pandoc -s README -o example4.tex

5.  From LaTeX to markdown:

        pandoc -s example4.tex -o example5.text

6.  reStructuredText:

        pandoc -s -t rst --toc README -o example6.text

7.  Rich text format (RTF):

        pandoc -s README -o example7.rtf

8.  Beamer slide show:

        pandoc -t beamer SLIDES -o example8.pdf

9.  DocBook XML:

        pandoc -s -S -t docbook README -o example9.db

10. Man page:

        pandoc -s -t man pandoc.1.md -o example10.1

11. ConTeXt:

        pandoc -s -t context README -o example11.tex

12. Converting a web page to markdown:

        pandoc -s -r html http://www.gnu.org/software/make/ -o example12.text

13. From markdown to PDF:

        pandoc README --latex-engine=xelatex -o example13.pdf

14. PDF with numbered sections and a custom LaTeX header:

        pandoc -N --template=mytemplate.tex --variable mainfont="Palatino" --variable sansfont="Century Gothic" --variable monofont="Consolas" --variable fontsize=12pt --variable version=1.15.2 README --latex-engine=xelatex --toc -o example14.pdf

15. A wiki program using [Happstack](http://happstack.com) and pandoc:
    [gitit](http://gitit.net)

16. HTML slide shows:

        pandoc -s --mathml -i -t dzslides SLIDES -o example16a.html

        pandoc -s --webtex -i -t slidy SLIDES -o example16b.html

        pandoc -s --mathjax -i -t revealjs SLIDES -o example16d.html

17. TeX math in HTML:

        pandoc math.text -s -o mathDefault.html

        pandoc math.text -s --mathml -o mathMathML.html

        pandoc math.text -s --webtex -o mathWebTeX.html

        pandoc math.text -s --mathjax -o mathMathJax.html

        pandoc math.text -s --latexmathml -o mathLaTeXMathML.html

18. Syntax highlighting of delimited code blocks:

        pandoc code.text -s --highlight-style pygments -o example18a.html

        pandoc code.text -s --highlight-style kate -o example18b.html

        pandoc code.text -s --highlight-style monochrome -o example18c.html

        pandoc code.text -s --highlight-style espresso -o example18d.html

        pandoc code.text -s --highlight-style haddock -o example18e.html

        pandoc code.text -s --highlight-style tango -o example18f.html

        pandoc code.text -s --highlight-style zenburn -o example18g.html

19. GNU Texinfo, converted to info, HTML, and PDF formats:

        pandoc README -s -o example19.texi

        makeinfo --no-validate --force example19.texi -o example19.info

        makeinfo --no-validate --force example19.texi --html -o example19

        texi2pdf example19.texi  # produces example19.pdf

20. OpenDocument XML:

        pandoc README -s -t opendocument -o example20.xml

21. ODT (OpenDocument Text, readable by OpenOffice):

        pandoc README -o example21.odt

22. MediaWiki markup:

        pandoc -s -S -t mediawiki --toc README -o example22.wiki

23. EPUB ebook:

        pandoc -S README -o README.epub

24. Markdown citations:

        pandoc -s -S --bibliography biblio.bib --filter pandoc-citeproc CITATIONS -o example24a.html

        pandoc -s -S --bibliography biblio.json --filter pandoc-citeproc --csl chicago-fullnote-bibliography.csl CITATIONS -o example24b.html

        pandoc -s -S --bibliography biblio.yaml --filter pandoc-citeproc --csl ieee.csl CITATIONS -t man -o example24c.1

25. Textile writer:

        pandoc -s -S README -t textile -o example25.textile

26. Textile reader:

        pandoc -s -S example25.textile -f textile -t html -o example26.html

27. Org-mode:

        pandoc -s -S README -o example27.org

28. AsciiDoc:

        pandoc -s -S README -t asciidoc -o example28.txt

29. Word docx:

        pandoc -s -S README -o example29.docx

30. LaTeX math to docx:

        pandoc -s math.tex -o example30.docx

31. DocBook to markdown:

        pandoc -f docbook -t markdown -s howto.xml -o example31.text

32. MediaWiki to html5:

        pandoc -f mediawiki -t html5 -s haskell.wiki -o example32.html

33. Custom writer:

        pandoc -t sample.lua example33.text -o example33.html

34. Docx with a reference docx:

        pandoc -S --reference-docx twocolumns.docx -o UsersGuide.docx README

35. Docx to markdown, including math:

        pandoc -s example30.docx -t markdown -o example35.md

36. EPUB to plain text:

        pandoc README.epub -t plain -o example36.text

</div>

</div>

</div>
