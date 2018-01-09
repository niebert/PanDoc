# PanDoc
PanDoc convert Documents from one format (e.g. MarkDown or HTML) to other formats (e.g. OpenOffice or Word) with Templates.

<h2> Table of Contents</h2>
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [News](#news)
- [Other Repositories Depending on PanDoc Repository](#other-repositories-depending-on-pandoc-repository)
- [Linux](#linux)
  - [Package Manager](#package-manager)
  - [Install PanDoc](#install-pandoc)
  - [Editor Geany](#editor-geany)
  - [Install LaTeX](#install-latex)
- [Mac-OSX](#mac-osx)
  - [Introduction](#introduction)
  - [Homebrew Installer](#homebrew-installer)
  - [Install PanDoc with HomeBrew](#install-pandoc-with-homebrew)
  - [Install Git and Download PanDoc Repository](#install-git-and-download-pandoc-repository)
  - [Clone this PanDoc-Repository](#clone-this-pandoc-repository)
  - [Editor Geany](#editor-geany-1)
  - [Install LaTeX](#install-latex-1)
  - [PanDoc Documentation about Installation](#pandoc-documentation-about-installation)
- [Windows](#windows)
  - [Pandoc Install Homepage](#pandoc-install-homepage)
  - [Install Git and Download PanDoc Repository](#install-git-and-download-pandoc-repository-1)
  - [Clone this PanDoc-Repository](#clone-this-pandoc-repository-1)
  - [Install LaTeX](#install-latex-2)
  - [Install Image Magick](#install-image-magick)
  - [Install Script for Windows](#install-script-for-windows)
- [PanDoc Tools](#pandoc-tools)
  - [Pandoc Demos](#pandoc-demos)
  - [Pandoc Online Converter](#pandoc-online-converter)
  - [PanConvert (Optional)](#panconvert-optional)
  - [PanDocElectron](#pandocelectron)
  - [PanDocZenity](#pandoczenity)
- [Main Folders](#main-folders)
- [Folders and Files](#folders-and-files)
  - [Project ReadMe](#project-readme)
  - [Project Config](#project-config)
  - [Media Files](#media-files)
- [Software Development and Tool](#software-development-and-tool)
  - [Atom and Electron](#atom-and-electron)
  - [DocToc for Table of Contents](#doctoc-for-table-of-contents)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## News
* CDN for MathJax maintained by Development Team is down (2017). The CDN link for remote script urls to that Javascript library had to. be changed.

## Other Repositories Depending on PanDoc Repository
This repository contains adapted templates for <tt>pandoc</tt>. This repository is used by the following Open Source applications:
* [PanDocElectron](http://niebert.github.io/PanDocElectron) Electron based wrapper/Graphical User Interface (GUI) for [PanDoc](http://pandoc.org)
* [PanDocZenity](http://www.github.com/niebert/PanDocZenity) Shell script based wrapper for [PanDoc](http://pandoc.org) that used [Zenity](https://help.gnome.org/users/zenity/stable/) (it is recommended to use PanDocElectron instead of PanDocZenity)
* [eProofJS](http://www.github.com/niebert/eProofJS) is a Authoring Tool for creating electronic proofs. It uses support files (e.g. MathJax) to generate, display and render for mathematical proofs as learning environments.


The following explaination show the basic installation of the underlying tool <tt>pandoc</tt> created by [John Mac Farlane](http://johnmacfarlane.net/tools.html) (Thank you very much for providing this great tool to the Open Source Community).

The following section refers to the Installation of PanDocZenity. For installation guides for other applications refer to the GitHub-pages of the desired project.

## Linux

The following commands assume, that you have Debian/Ubuntu/Mint Linux Operating System installed. If you use other
Linux Distribution install packages with you Package Manager.

### Package Manager
Assume that you have a Linux distribution with the package manager `apt-get`. If you have a different Linux distro installed, then use the similar packages in package manager on your distro.

### Install PanDoc

The following apt-get command is one line of code to install the `pandoc` software on your computer:

> `sudo apt-get install pandoc pandoc-citeproc`

### Editor Geany

Furthermore you can use an editor `geany` as an option to edit the source file.

> `sudo apt-get install geany`


### Install LaTeX

Install the LaTeX package with `apt-get`

> `sudo apt-get install texlive lmodern`

`lmodern.sty` install as Package necessary for PDF-Conversion

## Mac-OSX

### Introduction

The following sections provide details for application on MacOSX with `Homebrew`. Please install `homebrew` prior to the following steps

### Homebrew Installer

On [MacOS use HomeBrew Package Management](https://brew.sh) as package manager to install necessary packages especially `pandoc` and the package for processing of citation.

Follow the instruction on https://brew.sh to install `homebrew` on your Mac

### Install PanDoc with HomeBrew

> `brew install pandoc pandoc-citeproc`

### Install Git and Download PanDoc Repository

Open terminal and install git:

> `brew install git`

Now you navigate to your documents folder e.g.

> `cd /home/USERNAME/Documents`

### Clone this PanDoc-Repository

Clone the online `PanDoc` repository:

> `git clone https://github.com/niebert/PanDoc.git`


### Editor Geany

Furthermore you can use an editor `geany` as an option to edit the source file.

> `brew install geany`

You can use `TextWrangler` or other prefered editors instead.

### Install LaTeX

Install the LaTeX package from

> <https://tug.org/mactex/>

LaTeX in necessary for `pandoc` to process `LaTeX` file and/or generate `PDF` files.

### PanDoc Documentation about Installation

if you want to get more information about `PanDoc` installation, see section on

> <http://pandoc.org/installing.html>

## Windows

Install PanDoc on Windows

If you run [PanDoc Converter on Windows](https://pandoc.org/installing.html#windows) please follow the documentation on:

> `https://pandoc.org/installing.html#windows`


### Pandoc Install Homepage
For more information on installation of PanDoc converter see

>   [http://pandoc.org/installing.html](https://pandoc.org/installing.html#windows)

### Install Git and Download PanDoc Repository

Download the `git`-installer from the Homepage of Git `[git-scm.com](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)`

Then open terminal `CMD.exe` or `PowerShell` and change to your Documents folder:

Change Hard drive if necessary:

> `C:`

Now you navigate to your documents folder e.g.

> `cd \Users\USERNAME\Documents`

Where `USERNAME` is your user name on your Windows Operating System

### Clone this PanDoc-Repository

Clone the online `PanDoc` repository:

> `git clone https://github.com/niebert/PanDoc.git`

### Install LaTeX

Follow the LaTeX installation on the following website
> `https://miktex.org/howto/install-miktex`

Needed for converting/transcoding MediaWiki files to LaTeX or PDF.

### Install Image Magick

[Image Magick](https://www.imagemagick.org/script/advanced-windows-installation.php#download) is an command line image processing tool. In PanDocElectron and PanDocZenity it is used to split a PDF presentation into single images for a creating a web-based presentation

### Install Script for Windows
Create a Windows Batch File `install_pandoc.bat`:
See following URL for command examples for Batch Files on Windows.

>  [https://gist.github.com/breezhang/7732470](https://gist.github.com/breezhang/7732470)


## PanDoc Tools

### Pandoc Demos
Demo calls of PanDoc can be found on:

>   [http://pandoc.org/demos.html](http://pandoc.org/demos.html)

### Pandoc Online Converter
Convert Files with PanDoc and standard templates on:

>   [http://pandoc.org/try](http://pandoc.org/try)

### PanConvert (Optional)
If you want to use PanDoc with a Graphical User Interface please
innstall [PanConvert](https://sourceforge.net/projects/panconvert/) for Graphical User Interface for PanDoc:

>   [https://sourceforge.net/projects/panconvert/](https://sourceforge.net/projects/panconvert/)

### PanDocElectron
[PanDocElectron](http://niebert.github.io/PanDocElectron) Electron based wrapper/Graphical User Interface (GUI) for [PanDoc](http://pandoc.org)

### PanDocZenity
Similar to `PanDocElectron` but runs from the command line with the Zenity for handling user interactions. In comparison to the Electron based tool `PanDocZenity` has less features but it might be better for command line processes and automatisation of transcoding of documents.
[PanDocZenity](http://www.github.com/niebert/PanDocZenity) Shell script based wrapper for [PanDoc](http://pandoc.org) that used [Zenity](https://help.gnome.org/users/zenity/stable/) (it is recommended to use PanDocElectron instead of PanDocZenity)


## Main Folders

**Folder**            **Description**
--------------------  -------------------------------------------------------------         
`tpl`                 Templates and Default Files for PanDoc
`projects`            Contains all projects
`bib`                 Contains all BibTeX Databases/Bib-Styles
`help`                Contains Help Files for Installation et. al. if available
`mathjax`             Contains MathJax Installation for Math Rendering
`reveal`              Contains RevealJS Installation for HTML5 Presentations
--------------------  -------------------------------------------------------------

## Folders and Files

### Project ReadMe
The directory `project/readme` is one sample project that is used at
the same time for the readme of this project.  

### Project Config
All subdirectory e.g. `project/topologie` contains a subdirectory
`project/topologie/config` that contains author name and title for the project.


### Media Files
If the input file includes media files, the create
`/images`, `/videos`, `/audio` store the media files in the subdirectories.

## Software Development and Tool

### Atom and Electron
Create a Multiplattform Application with Atom and Electron for Linux Mac and Windows
or with Intel XDK Cloud Programming Tool.
>   [Website Atom Editor](http://electron.atom.io/)

Can be used for Linux, MacOSX and Windows.

### DocToc for Table of Contents
This README.md has a table of contents. This is automatically generated with `doctoc` NPM modules
>   [http://electron.atom.io/](http://electron.atom.io/)

Install `doctoc` with NPM (assuming you have NPM/NodeJS already installed on your computer)

> `npm install doctoc -g`

Installation is global so that you can use it for other GitHub repositories as well.

Create or Update the table of contents with the command:

> `doctoc README.md`
