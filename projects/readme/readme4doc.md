% PanDoc Shell Scripts for File Conversion
% Engelbert Niehaus

1 PanDoc Install
================
The following sections provide details for application on Linux (Ubuntu, Mint, Debian)

1.1 Linux Ubuntu Debian
-----------------------
The following apt-get command is one line of code:

> `sudo apt-get install pandoc pandoc-citeproc texlive lmodern`

lmodern.sty install as Package necessary for PDF-Conversion 
This leads to apt-get install of package "lmodern" on Linux.

1.2 Zenity for PANDOCmenu.sh 
-----------------------------
PANDOCmenu.sh is a shell script on Linux to support you in converting
  files with pandoc. The selection of Formats is performed with zenity therefore 
  it is necessary to install zenity on Linux or with homebrew on MacOS with

>  `sudo apt-get install zenity`

1.3 Editor Geany for PANDOCmenu.sh 
----------------------------------
Furthermore the script `PANDOCmenu.sh` uses an editor `geany` as an option in the menu
to modify the the source file.

>  `sudo apt-get install geany`


1.4 Start PANDOCmenu.sh 
-----------------------

If you want to run the PANDOCmenu.sh start open the Terminal on Linux and star
the following script with `sh`

>  `sh PANDOCmenu.sh`

1.5 Executable PANDOCmenu.sh 
----------------------------
In the terminal or make PANDOCmenu.sh executable with 

>  `chmod ug+x PANDOCmenu.sh `


2 Mac-OSX
=========
The following sections provide details for application on MacOSX with Homebrew.
Please install homebrew prior to the following steps

2.1 Mac-OSX and Homebrew
-----------------------

On MacOS installation of pandoc can be performed with home-brew as package 
manager and use „brew“ to install necessary packages especially `pandoc` 
and the package for processing citation in pandoc.

> `brew install pandoc pandoc-citeproc`

2.2 Zenity for PANDOCmenu.sh 
-----------------------------
PANDOCmenu.sh is a shell script on Linux to support you in converting
  files with pandoc. The selection of Formats is performed with zenity therefore 
  it is necessary to install zenity on Linux or with homebrew on MacOS with

>  `brew install zenity`

2.3 Editor Geany for PANDOCmenu.sh 
----------------------------------
Furthermore the script `PANDOCmenu.sh` uses an editor `geany` as an option in the menu
to modify the the source file.

>  `brew install geany`


2.4 Start PANDOCmenu.sh 
-----------------------

If you want to run the PANDOCmenu.sh start open the Terminal on Linux and star
the following script with `sh`

>  `sh PANDOCmenu.sh` 

2.5 Executable PANDOCmenu.sh 
----------------------------
In the terminal or make PANDOCmenu.sh executable with 

>  `chmod ug+x PANDOCmenu.sh `

2.6 Install LaTeX Package
-------------------------
Install the LaTeX package from 

> [https://tug.org/mactex/](https://tug.org/mactex/)

or if you want to fiddle around with a package manager check the MacOS Pandoc 
section on 

> [http://pandoc.org/installing.html](http://pandoc.org/installing.html)
  
3 Pandoc Homepage
=================
For more information on installation of PanDoc converter see

>   [http://pandoc.org/installing.html](http://pandoc.org/installing.html)

4 PanConvert (Optional)
=======================
If you want to use PanDoc with a Graphical User Interface please 
innstall [PanConvert](https://sourceforge.net/projects/panconvert/) for Graphical User Interface for PanDoc:

>   [https://sourceforge.net/projects/panconvert/](PanConvert)

5 ToDo
======
Create a Windows Batch File PANDOCmenu.bat with zenith:
See following URL for command examples for Batch Files on Windows.

>  [https://gist.github.com/breezhang/7732470](https://gist.github.com/breezhang/7732470)


6 Folders and Content 
=====================

**Folder**            **Description**
--------------------  ----------------------------------------------         
`tpl`                 Templates and Default Files for PanDoc
`projects`            Contains all projects 
`bib`                 Contains all BibTeX Databases/Bib-Styles
`help`                Contains Help Files for Installation et. al.
--------------------  ----------------------------------------------



