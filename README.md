# PanDoc
PanDoc Shell Scripts for Converting Documents using Zenity with Templates

Linux
=====

Install PanDoc
--------------

The following apt-get command is one line of code:

> `sudo apt-get install pandoc pandoc-citeproc`

Zenity for Menu
---------------

PANDOCmenu.sh is a shell script on Linux to support you in converting files with pandoc. The selection of Formats is performed with zenity therefore it is necessary to install zenity on Linux or with homebrew on MacOS with

> `sudo apt-get install zenity`

Editor Geany
------------

Furthermore the script `PANDOCmenu.sh` uses an editor `geany` as an option in the menu to modify the the source file.

> `sudo apt-get install geany`

Start Menu
----------

If you want to run the `PANDOCmenu.sh` start open the Terminal on Linux and star the following script with `sh`

> `sh PANDOCmenu.sh`

Executable Menu
---------------

In the terminal or make PANDOCmenu.sh executable with

> `chmod ug+x PANDOCmenu.sh`

Install LaTeX
-------------

Install the LaTeX package with `apt-get`

> `sudo apt-get install texlive lmodern`

lmodern.sty install as Package necessary for PDF-Conversion

Mac-OSX
=======

Introduction
------------

The following sections provide details for application on MacOSX with Homebrew. Please install homebrew prior to the following steps

Homebrew Installer
------------------

On MacOS use `homebrew` as package manager to install necessary packages especially `pandoc` and the package for processing of citation.

> `brew install pandoc pandoc-citeproc`

Zenity for Menu
---------------

PANDOCmenu.sh is a shell script on Linux to support users in converting files with pandoc. Install zenity with homebrew on MacOS:

> `brew install zenity`

Editor Geany
------------

Furthermore the script `PANDOCmenu.sh` uses an editor `geany` as an option in the menu to modify the the source file.

> `brew install geany`

Start Menu
----------

If you want to run the PANDOCmenu.sh start open the Terminal on Linux and star the following script with `sh`

> `sh PANDOCmenu.sh`

Executable Menu
---------------

In the terminal or make PANDOCmenu.sh executable with

> `chmod ug+x PANDOCmenu.sh`

Install LaTeX
-------------

Install the LaTeX package from

> <https://tug.org/mactex/>

Small LaTeX Install
-------------------

if you want to fiddle around with a package manager check the MacOS Pandoc section on

> <http://pandoc.org/installing.html>

Windows
=======

Batch Files
-----------

If you run converter on Linux the converter will create a windows batch file in the project directory. Start

> `win_reveal.bat`

Batch Examples
--------------

| **Batch File**   | **Description**                        |
|:-----------------|:---------------------------------------|
| `win_reveal.bat` | Batch File for Reveal Presentation     |
| `win_odt.bat`    | Batch File for LibreOffice Document    |
| `win_docx.bat`   | Batch File for MlCR0S0FT Word Document |
| `win_html.bat`   |                                        |


