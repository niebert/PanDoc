# PanDoc
PanDoc convert Documents from one format (e.g. MarkDown or HTML) to other formats (e.g. OpenOffice or Word) with Templates.
This repository contains adapted templates for <tt>pandoc</tt>. This repository is used by the following Open Source applications:
* [PanDocElectron](http://niebert.github.io/PanDocElectron) Electron based wrapper/Graphical User Interface (GUI) for [PanDoc](http://pandoc.org)
* [PanDocZenity](http://www.github.com/niebert/PanDocZenity) Shell script based wrapper for [PanDoc](http://pandoc.org) that used [Zenity](https://help.gnome.org/users/zenity/stable/) (it is recommended to use PanDocElectron instead of PanDocZenity)
* [eProofJS](http://www.github.com/niebert/eProofJS) is a Authoring Tool for creating electronic proofs. It uses support files (e.g. MathJax) to generate, display and render for mathematical proofs as learning environments.


The following explaination show the basic installation of the underlying tool <tt>pandoc</tt> created by [John Mac Farlane](http://johnmacfarlane.net/tools.html) (Thank you very much for providing this great tool to the Open Source Community).

The following section refers to the Installation of PanDocZenity. For installation guides for other applications refer to the GitHub-pages of the desired project.

Linux
=====

The following commands assume, that you have Debian/Ubuntu/Mint Linux Operating System installed. If you use other
Linux Distribution install packages with you Package Manager.

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

Start Zenity Menu
-----------------

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

If you run converter on Linux or Mac the converter will create a windows batch file in the project directory.

> `win_reveal.bat`

Batch Examples
--------------

| **Batch File**   | **Description**                        |
|:-----------------|:---------------------------------------|
| `win_reveal.bat` | Batch File for Reveal Presentation     |
| `win_odt.bat`    | Batch File for LibreOffice Document    |
| `win_docx.bat`   | Batch File for MlCR0S0FT Word Document |
| `win_html.bat`   | Batch File for HTML Document           |
-------------------  ----------------------------------------


Pandoc Install Homepage
=======================
For more information on installation of PanDoc converter see

>   [http://pandoc.org/installing.html](http://pandoc.org/installing.html)

Pandoc Demos
============
Demo calls of PanDoc can be found on:

>   [http://pandoc.org/demos.html](http://pandoc.org/demos.html)

Pandoc Online Converter
=======================
Convert Files with PanDoc and standard templates on:

>   [http://pandoc.org/try](http://pandoc.org/try)


PanConvert (Optional)
=====================
If you want to use PanDoc with a Graphical User Interface please
innstall [PanConvert](https://sourceforge.net/projects/panconvert/) for Graphical User Interface for PanDoc:

>   [https://sourceforge.net/projects/panconvert/](https://sourceforge.net/projects/panconvert/)

ToDo Windows
============
Create a Windows Batch File PANDOCmenu.bat with zenity:
See following URL for command examples for Batch Files on Windows.

>  [https://gist.github.com/breezhang/7732470](https://gist.github.com/breezhang/7732470)


Main Folders
============

**Folder**            **Description**
--------------------  -------------------------------------------------------------         
`tpl`                 Templates and Default Files for PanDoc
`projects`            Contains all projects
`bib`                 Contains all BibTeX Databases/Bib-Styles
`help`                Contains Help Files for Installation et. al. if available
--------------------  -------------------------------------------------------------

Folders
=======
Project ReadMe
--------------
The directory `project/readme` is one sample project that is used at
the same time for the readme of this project.  

Project Config
--------------
All subdirectory e.g. `project/topologie` contains a subdirectory
`project/topologie/config` that contains author name and title for the project.


Media Files
-----------
If the input file includes media files, the create
`/images`, `/videos`, `/audio` store the media files in the subdirectories.

Software Development
====================
Atom and Electron
-----------------
Create a Multiplattform Application with Atom and Electron for Linux Mac and Windows
or with Intel XDK Cloud Programming Tool.
>   [http://electron.atom.io/](http://electron.atom.io/)
