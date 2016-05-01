#!/bin/bash
clear
####################################
# PANDOCmenu.sh 
# -------------
# Engelbert Niehaus
# Created: 2016/03/28
####################################
title="My Title"
author="My Author Name"
# VARIABLE DEFINITION for DIRECTORIES
# REL is the relative directory from script location of PANDOCmenu.sh
# to template folder tpl/ bib/ and projects/
REL="./"
RELUP="../../"
PWD=`pwd`
# Name of Directory, where PanDoc projects are stored
PROJECTS="projects"
# add the relative path to project directory according to PANDOCmenu.sh
# use "./" if project directory is in the same directory as PANDOCmenu.sh
projectDIR="${REL}${PROJECTS}"
projectDIRABS="${PWD}/${PROJECTS}"
inputDIR="$projectDIR"
outputDIR="$projectDIR"
inputFORMAT="md"
outputFORMAT="odt"
inputFILE="$inputDIR"
outputFILE=""
bibtexFILE=""
tplFILE=""
defaultEXTENSION="wiki"
# DIRECTORY SELECT
# zenity --info --text "PANDOC Menu\n----------\nPlease select the folder of your current PANDOC project or\npress [Cancel] and create a new PanDoc Project"
# ----------------------
pandocPROJECT="xxx"
# ----------------------
baseDIR="$projectDIR"
#-----BibTeX: Path and Files-----
BIB="bib"
bibDEFAULT="biblio.bib"
cslDEFAULT="default.csl"
TPL="tpl"
BIBDATA="${BIB}/data"
BIBCSL="${BIB}/csl"
bibDIR="${REL}${BIBDATA}"
bibFILE="${bibDIR}/${bibDEFAULT}"
bibbaseDIR="${REL}${BIB}"
tplbaseDIR="${REL}${TPL}"
cslDIR="${REL}${BIBCSL}"
cslFILE="${cslDIR}/${cslDEFAULT}"
#-----Templates: Path and Files----
tplDIR="${tplbaseDIR}/reveal"
tmpDIR="$inputDIR/tmp"
inputDIRFORMAT="$inputDIR/wiki"
echo "Startup PANDOC Project Directory: $pandocPROJECT"
echo "Working Directory: ${PWD}"
echo "inputDIR = $inputDIR" 
while true; do
	# "Output" "Select OUT Format" \
	# "xxx" means Project not selected yet		 
	case $pandocPROJECT in 
		xx) pandocCMD="Debug"
			;;
		xxx)
			pandocCMD=`zenity --list \
			 --title="Choose your PANDOC Command" \
			 --column="PANDOC" --column="File Type Action" \
			  "Create" "PanDoc Project" \
			  "Input" "Select Project File" \
			  "Quit" "Exit Enviroment"`
			;;
		*)	pandocCMD=`zenity --list \
			 --title="Choose your PANDOC Command" \
			 --column="PANDOC" --column="File Type Action" \
			  "Convert" "PANDOC CONVERT" \
			  "Editor" "Edit Source File" \
			  "View" "Generated Output - Display" \
			  "Config" "Templates, BibTeX, Remove Project" \
			  "Quit" "Exit Enviroment"`
			;;
	esac
	echo "(1) PANDOC Command: $pandocCMD"
	pandocPROC="${pandocCMD}"
	# For CREATE enter a new Subdirectory of pandocPROJECT
	pandocNEWDIR=""
	################################################################
	# -1- CREATE, SELECT OR PREPARE PROJECT DIR
	################################################################
	case $pandocCMD in
	   Debug)  pandocNEWDIR="topologie"
	           NAMEext="topologie.wiki"
	           pandocPROJECT="$baseDIR/$pandocNEWDIR"
	           echo "(DEBUG-1-${pandocCMD}) ${pandocPROJECT}"
	           EXTENSION="wiki"
	           inputFORMAT="wiki"
	           inputFILE="${pandocPROJECT}/${NAMEext}"
	          ;;
	   Create) pandocNEWDIR=`zenity --title="New PANDOC Project Directory" --entry --entry-text="newproject"  text="New PANDOC Folder Name"`
	           pandocPROJECT="${PWD}/${PROJECTS}/$pandocNEWDIR"
	           echo "(1-${pandocCMD}) ${pandocPROJECT}"
	           mkdir "${pandocPROJECT}"
	           ## Copying the Files into Directory is performed in Step (2-Create)
	          ;;
	   Input) echo "(1-${pandocCMD}) Select Input File "
	   		  if [ "$pandocPROJECT" == "xxx" ]; then
				  echo "PanDoc Project was undefined! Set to default '${projectDIR}'."
				  #pandocPROJECT="${projectDIR}"
				  pandocPROJECT="${PWD}/${PROJECTS}"
			  fi
			  #inputFILE=`zenity --file-selection --title="Select a PANDOC Input File" --filename="${pandocPROJECT}/" --file-filter=""*.md" "*.wiki" "*.tex"" `
			  inputFILE=`zenity --file-selection --title="Select a PANDOC Input File" --filename="${pandocPROJECT}/" --file-filter=""*.md" "*.wiki" "*.tex""  `
			  pandocPROJECT=${inputFILE%/*}  # get the part before the last slash "/"
 			  NAMEext=${inputFILE##*/}  # get the part after the last slash
			  EXTENSION=${NAMEext##*.}  # get part after the last dor "."
	    	  NAME=${NAMEext%.*}        # get part before the last dot "."									
			  case $? in
						 0) if [ -z "$inputFILE" ]; then
								echo "Error: Input File is empty"
								echo "Quit: $0 "
								exit
							else
								echo "(1-${pandocCMD}-OK) \"$inputFILE\" selected."
								echo "Project:    ${pandocPROJECT} "
								echo "Input File: ${NAMEext} "
								echo "Extension:  ${EXTENSION} "
							fi		
							;;
						 1)
								echo "${pandocCMD}: No input file selected"
								echo "Will copy default input to $pandocPROJECT"
								inputFORMAT="wiki"
								echo "Input Format: ${inputFORMAT} "
								nameFILE="default.${inputFORMAT}"
								defaultFILE="${tplbaseDIR}/${inputFORMAT}/${nameFILE}"
								echo "Use Default File: $defaultFILE"
								pandocPROJECT="${projectDIR}/default"
								if [ -d "$pandocPROJECT" ]
								then
									echo "Directory: $pandocPROJECT found."
								else
									mkdir "$pandocPROJECT"
								fi
								inputFILE="${pandocPROJECT}/${nameFILE}"
								if [ -f "$inputFILE" ]
								then
									echo "Input File: $inputFILE found."
								else
									echo "$inputFILE not found. Copy default file!"
									cp $defaultFILE $pandocPROJECT
									echo "File: $inputFILE created!" 
								fi
							;;
						-1)
								echo "(Error-1-${pandocCMD}) An unexpected error has occurred."
							;;
				esac			   	
	          ;;
	    Convert)  echo "(1-${pandocCMD}) Convert Project: $pandocCMD "
	    	   echo "Selelect $pandocCMD Format for Document"
	   		  	outputFORMAT=`zenity --list \
					--title="Select OUTPUT Format" \
					--column="Type" --column="Output Format" \
					  "reveal" "Reveal JS Presentation" \
					  "odt" "Libre Office Format" \
					  "docx" "0ffice DOCX Format" \
					  "latex" "LaTeX Source File" \
			  		  "beamer" "LaTeX Beamer Presentation" \
					  "html" "HTML for Browsers" \
					  "dzslides" "DZ Slides Presentation" \
					  "wiki" "WikiMedia Output"`
	            
	            echo "Output format: $outputFORMAT"	
	            inFILE=${inputFILE##*/}  # get the part before the last dot "."
	            echo "(1--${pandocCMD}) Input File format: "
	            echo "  inFILE='${inFILE}'"
	            case $outputFORMAT in
	            	reveal) ##### REVEAL PRESENTATION #####################
	   	         		echo "(3-OUT) Output Format: $outputFORMAT "        		
	            		outEXTENSION="html"
	            		OUTtype="html5"
	            		;;
	            	odt) ##### LIBREOFFICE ODT ######################
	            		echo "(3-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="$outputFORMAT"
	            		OUTtype="$outputFORMAT"
	            		;;
	            	docx) ##### OFFICE DOCX #########################
	            		echo "(3-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="$outputFORMAT"
	            		OUTtype="$outputFORMAT"
	            		;;
	            	html) ##### HTML DOCX #########################
	            		echo "(3-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="$outputFORMAT"
	            		OUTtype="$outputFORMAT"
	            		;;
	            beamer) ##### LATEX BEAMER #########################
	            		echo "(3-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="pdf"
	            		OUTtype="$outputFORMAT"
	            		;;
	            dzslides) ##### DZSLIDES ###########################
	            		echo "(3-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="html"
	            		OUTtype="$outputFORMAT"
	            		;;
	            latex) ##### DZSLIDES ###########################
	            		echo "(3-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="tex"
	            		OUTtype="$outputFORMAT"
	            		;;
	              wiki) ##### MEDIAWIKI ###########################
	            		outEXTENSION="${outputFORMAT}"
	            		OUTtype="mediawiki"
						;;
	            esac
	            #RELUP="../../"
	            #TPL="tpl"
				templateREL="${RELUP}${TPL}/${outputFORMAT}/tpldefault.$outEXTENSION"
	            echo "(1--${pandocCMD}) Set Template relative to Project Directory"
	            echo " templateREL='${templateREL}' "
	            #cslDEFAULT="default.csl"
				#BIBCSL="${BIB}/csl"
	            cslFILEREL="${RELUP}${BIBCSL}/${cslDEFAULT}"
	            echo " cslFILEREL='${cslFILEREL}' "
				#bibDEFAULT="biblio.bib"
				#BIBDATA="${BIB}/data"
				bibFILEREL="${RELUP}${BIBDATA}/${bibDEFAULT}"
	            echo " bibFILEREL='${bibFILEREL}' "
				
	    	 ;;
	  Config) echo "(1-${pandocCMD}) Configuration of PanDoc Menu"
	   		  echo "Selelect $pandocCMD Format for Document"
	   		  pandocPROC=`zenity --list \
				--title="Select Template" \
				--column="Type" --column="Template" \
			  "TPL" "Select Template Default" \
			  "BIB" "Select BibTeX Default" \
			  "Remove" "Remove Project Files" \
			  "QUIT" "Quit Configuration"`
	            
	            echo "Output format: $outputFORMAT"
				#inputDIRFORMAT="$inputDIR/$inputFORMAT"
	            ;;
		Editor)  echo "(1--${pandocCMD}) Start Editor for Project: $pandocCMD "
	    	  ;;
		View)  echo "(1--${pandocCMD}) View Generated File for Project: $pandocCMD "
	    	  ;;
	   *) echo "Exist PANDOC Zenity";exit;;
	esac
	#######################################################
	#------CONFIG DIRECTORY of PROJECT---------------------
    #######################################################
	echo "(2-CONFIG) Check Config Directory: $configDIR"
	configDIR="${pandocPROJECT}/config"
	if [ -d "$configDIR" ]; then 
  		if [ -L "$configDIR" ]; then
    		# It is a symlink!
    		# Symbolic link specific commands go here.
    		rm "$configDIR"
    		echo "(2-CONFIG) Remove SymLink and create Directory exists: $configDIR"
    		mkdir "$configDIR"
  		else
    		# It's a directory!
    		# Directory command goes here.
    		echo "(2-CONFIG) Config Directory exists: $configDIR"
  		fi
  	else 
    	echo "(2-CONFIG) Create Directory exists: $configDIR"
    	mkdir "$configDIR"
	fi
	#------CONFIG DIRECTORY: AUTHOR---------------------
    if [ -f "${configDIR}/author.txt" ]
 	 then
 	 	author=`cat "${configDIR}/author.txt"`
    	echo "Author: $author"
    	echo "loaded from ${configDIR}/author.txt"
	fi
	#------CONFIG DIRECTORY: TITLE----------------------
    if [ -f "${configDIR}/title.txt" ]
 	 then
 	 	title=`cat "${configDIR}/title.txt"`
    	echo "Title: $title"
    	echo "loaded from ${configDIR}/title.txt"
	fi
						
	################################################################
	# -2- PERFORM OPERATION IN PROJECT DIR
	################################################################
	echo "(3) PANDOC Project Processing: $pandocPROJECT "
	batchPREFIX="${projectDIR}/readme/readme"
	# Select the PANDOC Input document
	case $pandocPROC in
	   Create) echo "(3-${pandocPROC}) create or select an default input file"
	   			Answer=`zenity --list \
				--title="Do want to select an input file?" \
				--column="Answer" --column="Operation" \
				"SELECT" "Select an Input File for the Pandoc project." \
				"NEW" "Enter a default filename for NEW Pandoc project" \
	            "DOWNLOAD" "Download and Convert an Input File from Web." `
				echo "(3-${pandocPROC}-${Answer}) CREATE Input File for ${pandocPROJECT}: $Answer"
				case $Answer in
	              SELECT) 
	              		echo "Perform File Selection for PanDoc Project"
	                  	echo "Create Check: $Answer"
						echo "select Input File"
	   	       		  	selectFILE=`zenity --file-selection --title="Select a PANDOC Input File"`
			        	echo "\"$selectFILE\" selected for '$pandocPROJECT'"
						# E.g. inputFILE="/home/user/Documents/myfile.html" creates
						# NAMEext="myfile.html" by the following command. 
						NAMEext=${selectFILE##*/} # get the part after the last slash
						EXTENSION=${NAMEext##*.}  # get part after the last dot "."
	              		NAME=${NAMEext%.*}        # get part before the last dot "."	
	              		inputFILE="${pandocPROJECT}/${NAMEext}"
	              		echo "Selected File: ${selectFILE}"
	              		echo "Input File:    ${inputFILE}"
	              		cp "${selectFILE}" "${inputFILE}"
	              ;;
				  NEW) echo "Enter PanDoc Input file and use default"
				  		## DefaultNAME is set for Text Edit window in zenity ###
				  		defaultNAME=${pandocPROJECT##*/} # get the part after the last slash
						defaultNAME="${defaultNAME}.${defaultEXTENSION}"
						NAMEext=`zenity --title="New PANDOC Input File" --entry --entry-text="${defaultNAME}"  text="New PANDOC Input Filename"`
						EXTENSION=${NAMEext##*.}  # get part after the last dor "."
				    	NAME=${NAMEext%.*}        # get part before the last dot "."	
				    	#pandocPROJECT="${pandocDIR}/${NAME}"
	          			echo "PanDoc Project: ${pandocPROJECT}"
	          			case $EXTENSION in 
							md) 	echo "Markdown as Input Format"
									inputFILE="${pandocPROJECT}/${NAMEext}"
									cp "${tplbaseDIR}/DEFAULT/${EXTENSION}/default.${EXTENSION}"  "$inputFILE"
									echo "Input File: $inputFILE"
									inputFORMAT="${EXTENSION}"
								;;
							wiki)  	echo "WikiMedia as Input Format"
									inputFILE="${pandocPROJECT}/${NAMEext}"
									cp "${tplbaseDIR}/DEFAULT/${EXTENSION}/default.${EXTENSION}"  "$inputFILE"
									inputFORMAT="${EXTENSION}"
								;;
									
							*)  echo "(3-${pandocPROC}-${EXTENSION}) "
								echo "ERROR-01: No Valid Extension in '$pandocCMD' as Input Format"	
								
							 ;;
						esac # case EXTENSION
						echo "(3-${pandocCMD}-${Answer})  Input File: $inputFILE "
	           		;;
	           	DOWNLOAD) echo "Download and Convert PanDoc Input file"
				  		## DefaultNAME is set for Text Edit window in zenity ###
				  		defaultNAME=${pandocPROJECT##*/} # get the part after the last slash
						defaultNAME="${defaultNAME}.${defaultEXTENSION}"
						NAMEext=`zenity --title="New PANDOC Filename" --entry --entry-text="web${defaultNAME}"  text="New PANDOC Input Filename"`
						EXTENSION=${NAMEext##*.}  # get part after the last dor "."
				    	NAME=${NAMEext%.*}        # get part before the last dot "."	
				    	#pandocPROJECT="${pandocDIR}/${NAME}"
	          			URLweb=`zenity --title="Enter URL" --entry --entry-text="http://pandoc.org/demos.html"  text="New PANDOC Input Filename"`
						echo "PanDoc Project: ${pandocPROJECT}"
	          			echo "Convert and Download from URL: ${URLweb}"
	          			case $EXTENSION in 
							md) 	echo "Markdown as Input Format"
									inputFILE="${pandocPROJECT}/${NAMEext}"
									echo "Input File: $inputFILE"
									inputFORMAT="${EXTENSION}"
									convertFORMAT="markdown"
									pandoc -s -r html $URLweb -o $inputFILE
								;;
							wiki)  	echo "WikiMedia as Input Format"
									inputDOWNLOAD="${pandocPROJECT}/${NAME}.md"
									inputFILE="${pandocPROJECT}/${NAMEext}"
									inputFORMAT="${EXTENSION}"
									convertFORMAT="mediawiki"
									pandoc -s -r html $URLweb -t ${convertFORMAT} -o $inputDOWNLOAD
									pandoc -s -S -t mediawiki $inputDOWNLOAD -o $inputFILE
								;;
									
							*)  echo "(3-${pandocPROC}-${EXTENSION}) "
								echo "ERROR-01: No Valid Extension in '$pandocCMD' as Input Format"	
								
							 ;;
						esac # case EXTENSION
						echo "(3-${pandocCMD}-${Answer})  Download finished for '${URLweb}' and Input File: $inputFILE "
	           		;;
	           esac # case Answer
	           echo "(3-${pandocPROC}) Create Finished NAME=${NAMEext}  inputFORMAT=${EXTENSION}"
	   		;;
	   Editor)  echo "(3-${pandocPROC}) Check Scanned Files execute PANDOC recognize: $pandocCMD "
	           geany $inputFILE
	            ;;
	  Convert)  echo "(3-${pandocPROC}) Process Case for Input Format $inputFORMAT "
	            case $inputFORMAT in
	            	md)
	            		echo "(3-IN) Input Format: $inputFORMAT "
	            		INtype="markdown"
	            		;;
	            	wiki)
	            		echo "(3-IN) Input Format: $inputFORMAT "
	            		INtype="mediawiki"
	            		# ---- EDIT AUTHOR ---------
	            		author=`zenity --title="Edit Author" --entry --entry-text="${author}"  text="Edit Author for ${outputFORMAT} "`
						echo "$author" > "${configDIR}/author.txt"						
						# ---- EDIT TITLE ----------
	            		title=`zenity --title="Edit Title" --entry --entry-text="${title}"  text="Edit Title for ${outputFORMAT} "`
						echo "$title" > "${configDIR}/title.txt"	
	            		;;
	            	*) echo "(3-IN) Format $inputFORMAT is not allowed!"
	            		echo "Exit $0 - inputFORMAT=$inputFORMAT "
	            		exit
	            		;;
	            esac
	            inNOEXT=${inFILE%.*}  # get the part before the last dot "."
	            echo "(3-${pandocPROC}) Change Directory ${pandocPROJECT} "
	            cd "${pandocPROJECT}"
	            echo "(3-${pandocCMD}) Output Format: '$outputFORMAT' for inNOEXT='${inNOEXT}'"	
	            template="${tplbaseDIR}/${outputFORMAT}/tpldefault.${outEXTENSION}"
	            echo "--------------------------------------------"
				echo "(3-OUT) Output Format: $outputFORMAT "
	            case $outputFORMAT in
	            	reveal) ##### REVEAL PRESENTATION #####################
	            		theme=`zenity --list \
							--title="Select REVEAL Slide Theme" \
							--column="Reveal" --column="Slide Theme" \
					  		"beige" "Reveal JS Presentation" \
					  		"simple" "Simple White Background" \
					  		"sky" "Sky Blue Background (UpperCase)" \
					  		"serif" "Serif White Background" \
					  		"blood" "Black Background with Red Links" \
					  		"moon" "Moon Reveal Theme" \
					  		"solarized" "Solarized Reveal Theme" \
					  		"black" "Black Background"`
	            
	            		#theme="beige"
	            		echo "Reveal Theme: '${theme}' selected"
	            		lvEXT="_${outputFORMAT}.${outEXTENSION}"
	            		outFILE="${inNOEXT}${lvEXT}"
	            		echo "--------------------------------------------"
						echo "PROJECT:      ${pandocPROJECT}"
						echo "Title:        ${title}"
						echo "Author:       ${author}"
						echo "Reveal Theme: ${theme} "          
						echo "Input File:   ${inFILE}"
						echo "Output File:  ${outFILE}"
						echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "--------------------------------------------"
						callStr=" pandoc -f ${INtype} -t ${OUTtype} --mathjax --template=${templateREL}  --bibliography ${bibFILEREL} --standalone --section-divs --variable author=\"${author}\" --variable title=\"${title}\" --variable theme=${theme} --variable transition=\"slide\" ${inFILE} -o ${outFILE} --csl ${cslFILEREL}"
						echo $callStr 
						#$callStr 
	            		pandoc -f ${INtype} -t ${OUTtype} --mathjax --template=${templateREL}  --bibliography ${bibFILEREL} --standalone --section-divs --variable author="${author}" --variable title="${title}" --variable theme=${theme} --variable transition="slide" ${inFILE} -o ${outFILE} --csl ${cslFILEREL}
						#-------------SED Template Correction--------------------
						#---- sed corrects an replace error in css path .../css/"beige".css by .../css/beige.css
						eval "sed 's/css\/\\\"${theme}\\\"/css\/${theme}/g'  ${outFILE} > tmp.txt" 
						mv ${pandocPROJECT}/tmp.txt  ${outFILE} 
						#---EXPORT BATCH FILE------------------------------------
						callStr=" pandoc  -f ${INtype} -t ${OUTtype} --mathjax  --template=${templateREL}  --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes --standalone --section-divs  --variable author=\"${author}\" author=\"${title}\"  --variable transition=slide ${inFILE} -o ${outFILE} --csl ${cslFILEREL}"
						callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "--------------------------------------------"
						
					;;
	            	odt) ##### LIBREOFFICE ODT ######################
	            		#lvEXT="_${outputFORMAT}.${outEXTENSION}"
	            		lvEXT=".${outEXTENSION}"
	            		outFILE="${inNOEXT}${lvEXT}"
	            		echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inFILE}"
						echo "Output File: ${outFILE}"
						echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						callStr="pandoc -S --reference-${outEXTENSION} ${templateREL} --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outFILE} ${inFILE} --csl ${cslFILEREL}"
						echo $callStr
						$callStr
	            		#---EXPORT BATCH FILE------------------------------------
						callStr="pandoc -S --reference-${outEXTENSION} ${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfileBAT} ${infileBAT} --csl ${cslFILE}"
						callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"

	            		;;
	            	latex) #### LATEX ######################
	            		outEXTENSION="tex"
	            		template="${tplbaseDIR}/${outputFORMAT}/tpl4paper.${outEXTENSION}"
	            		inputNOEXT=${inputFILE%.*}  # get the part before the last dot "."
	            		##outfile="${inputNOEXT}.${outEXTENSION}"
 						lvEXT="_${outputFORMAT}.pdf"
	            		outfilePDF="${inNOEXT}${lvEXT}"
 						#lvEXT="_${outputFORMAT}.${outEXTENSION}"
	            		lvEXT=".${outEXTENSION}"
	            		outFILE="${inNOEXT}.tex"
	            		echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inFILE}"
						echo "Output File: ${outFILE}"
						echo "Output PDF:  ${outfilePDF}"
						echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						echo "Create TeX-file"
						pandoc -s --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes -o ${outFILE} ${inFILE} --csl ${cslFILEREL}
						#callStr="pandoc -S --reference-${outEXTENSION} ${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfilePDF} ${inputFILE} --csl ${cslFILE}"
						echo "Create PDF-file"
						callStr="pandoc -N --template=${templateREL} --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes --variable mainfont=\"Palatino\" --variable monofont=\"Consolas\" --variable fontsize=12pt --variable version=1.0 ${inFILE} --latex-engine=xelatex --toc -o ${outFILE}"
						echo $callStr 
	            		$callStr 
	            		#---EXPORT BATCH FILE------------------------------------
						callStr="pandoc -N --template=${templateREL} --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes --variable mainfont=\"Palatino\" --variable monofont=\"Consolas\" --variable fontsize=12pt --variable version=1.0 ${inFILE} --latex-engine=xelatex --toc -o ${outFILE}"
						callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
					;;
	            	beamer) #### BEAMER ######################
	            		lvEXT="_${outputFORMAT}.${outEXTENSION}"
	            		outFILE="${inNOEXT}${lvEXT}"
	            		echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inFILE}"
						echo "Output File: ${outFILE}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						callStr="pandoc -S --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outFILE} ${inFILE} --csl ${cslFILEREL}"
						#pandoc -t beamer SLIDES -o example8.pdf
	            		$callStr 
	            		#---EXPORT BATCH FILE------------------------------------
						callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
	            		;;
	            	docx) #### DOCX ######################
	            		#lvEXT="_${outputFORMAT}.${outEXTENSION}"
	            		lvEXT=".${outEXTENSION}"
	            		outFILE="${inNOEXT}${lvEXT}"
	            		echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inFILE}"
						echo "Output File: ${outFILE}"
						echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						echo pandoc -S --reference-${outEXTENSION} ${templateREL} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outFILE} ${inFILE} --csl ${cslFILEREL}
						#pandoc -S --reference-${outEXTENSION} ${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}
						callStr="pandoc -S --reference-${outEXTENSION} ${templateREL} --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outFILE} ${inFILE} --csl ${cslFILEREL}"
						$callStr 
	            		#---EXPORT BATCH FILE------------------------------------
						#callStr="pandoc -S --reference-${outEXTENSION} ${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfileBAT} ${infileBAT} --csl ${cslFILE}"
						callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
	            		;;
	            	html) #### HTML with pandoc.css ######################
	            		cssFILE="pandoc.css"
 						echo "Copy '${cssFILE}' to project folder ${pandocPROJECT}"
	            		cp "${tplbaseDIR}/${outputFORMAT}/${cssFILE}" "${pandocPROJECT}"
	            		#lvEXT="_${outputFORMAT}.${outEXTENSION}"
	            		lvEXT=".${outEXTENSION}"
	            		outFILE="${inNOEXT}${lvEXT}"
	            		echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inFILE}"
						echo "Output File: ${outFILE}"
						echo "CSS-File:        ${cssFILE}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						#pandoc -s -S --toc -c pandoc.css -A footer.html README -o example3.html
	            		callStr="pandoc -s -S --toc  -c ${cssFILE} --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes -o ${outFILE} ${inFILE} --csl ${cslFILEREL}"
	            		$callStr 
	            		#---EXPORT BATCH FILE------------------------------------
						# callStr="pandoc -s -S --toc  -c ${cssFILE} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -o ${outfileBAT} ${infileBAT} --csl ${cslFILE}"
	            		callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
	            		;;
	              wiki) #### MEDIAWIKI ######################
	              		#lvEXT="_${outputFORMAT}.${outEXTENSION}"
	            		lvEXT=".${outEXTENSION}"
	            		outFILE="${inNOEXT}${lvEXT}"
	            		echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inFILE}"
						echo "Output File: ${outFILE}"
						echo "Output Type: ${OUTtype}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						callStr="pandoc -s -S --toc --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outFILE} ${inFILE} --csl ${cslFILEREL}"
	            		$callStr 
	            		#---EXPORT BATCH FILE------------------------------------
						callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
	            		
	              		;;
	            	dzslides) #### DZSLIDES ######################
	            		lvEXT="_${outputFORMAT}.${outEXTENSION}"
	            		outFILE="${inNOEXT}${lvEXT}"
	            		echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inFILE}"
						echo "Output File: ${outFILE}"
						#echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						#pandoc -S "--reference-${outEXTENSION} ${template}" --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}
						# pandoc -s --mathml -i -t dzslides SLIDES -o example16a.html
						callStr="pandoc -s  --mathml -i -t ${OUTtype} --bibliography ${bibFILEREL} -f ${INtype}+simple_tables+footnotes  -o ${outFILE} ${inFILE} --csl ${cslFILEREL}"
						$callStr 			
	            		#---EXPORT BATCH FILE------------------------------------
						#callStr="pandoc -s  --mathml -i -t ${OUTtype} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -o ${outfileBAT} ${infileBAT} --csl ${cslFILE}"
						callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"

	            		;;
	            	*)  echo "(3-OUT) Output Format: $outputFORMAT is not allowed"
	            	    exit
	            	    ;;
	            esac
	            cd "${PWD}"
	            echo "(4) Going back to default directory"
	            echo "(4) Directory='${PWD}' "
	            zenity --info --text "PANDOC Convert\n--------------\nConvert File from $inputFORMAT to $outputFORMAT done!"

	            ;;
	   View) echo "View PANDOC Output-File: $pandocPROJECT "
				currentPROJECT=${pandocPROJECT##*/}
				echo "(3-View) currentPROJECT=$currentPROJECT "
	            pandocPROJECTABS="${projectDIRABS}/${currentPROJECT}"
				echo "(3-View) pandocPROJECTABS=${pandocPROJECTABS} "
	            NAMEext=${inputFILE##*/}  # get the part after the last slash
				EXTENSION=${NAMEext##*.}  # get part after the last dot "."
				NAME=${NAMEext%.*}        # get the part before the last dot "."
				case $outputFORMAT in
	            	reveal) echo "Firefox View ${outputFORMAT}-Presentation in HTML"
	            		echo "firefox $pandocPROJECTABS/${NAME}_${outputFORMAT}.html"
	            		firefox "file://$pandocPROJECTABS/${NAME}_${outputFORMAT}.html"
	            		;;
	            	dzslides) echo "Firefox View ${outputFORMAT}-Presentation in HTML"
	            		echo "firefox file://$pandocPROJECTABS/${NAME}_${outputFORMAT}.html"
	            		firefox "file://$pandocPROJECTABS/${NAME}_${outputFORMAT}.html"
	            		;;
	            	html) echo "Firefox View in HTML"
	            		echo "firefox $pandocPROJECTABS/${NAME}.html"
	            		firefox "file://$pandocPROJECTABS/${NAME}.html"
	            		;;
	            	odt) echo "LibreOffice Writer $pandocPROJECT/${NAME}.odt"
	            		echo "libreoffice  --writer -o $pandocPROJECT/${NAME}.odt"
	            		libreoffice  --writer -o $pandocPROJECTABS/${NAME}.odt
	            		;;
	            	docx)  echo "LibreOffice Writer $pandocPROJECT/${NAME}.docx"
	            		echo "libreoffice  --writer -o $pandocPROJECTABS/${NAME}.docx"
	            		libreoffice  --writer -o $pandocPROJECTABS/${NAME}.docx
	            		;;
	            	latex) echo "LaTeX View in PDF"
	            		echo "evince $pandocPROJECTABS/${NAME}.pdf"
	            		evince $pandocPROJECTABS/${NAME}.pdf
	            		;;
	            	*) echo "Format $outputFORMAT is not allowed!"
	            		;;
	            esac
	   ;;
	  BIB)  echo "(3-${pandocCMD}-${pandocPROC}) Select the BibTeX-File for Project "
	   		   bibFILENEW=`zenity --file-selection --filename="${PWD}/${BIB}/"--title="Select a PANDOC BibTeX File"`
			   case $? in
						 0)
								echo "\"$bibFILENEW\" selected."
								BIBLIOext=${bibFILENEW##*/}  # get the part after the last slash
			  					EXTENSIONbib=${BIBLIOext##*.}  # get part after the last dot "."
								if [ "$BIBLIOext" == "biblio.bib" ]; then
  									echo "Used existing 'biblio.bib'"
  								else 
  									if ["$EXTENSIONbib" -eq "bib" ]; then
  										echo "Copy '${bibFILENEW}' to 'biblio.bib'"
  										cp "${bibFILENEW}"  "${bibDIR}/biblio.bib"
  									else 
  										echo "ERROR: $BIBLIOext has wrong file format"
  									fi
								fi		
							;;
						 1)
								echo "${pandocCMD}: No input file selected"
								echo "Select default BibTeX-File to $pandocPROJECT"
								nameFILE="biblio.bib"
								# defaultFILE="${bibDIR}/${nameFILE}"
								# echo "    $defaultFILE"
								bibFILE="${bibDIR}/${nameFILE}"
								if [ -f "$bibFILE" ]
								then
									echo "$bibFILE found."
								else
									echo "(1-${pandocCMD}) ERROR:"
									echo "$bibFILE not found. Copy default file to directory!"
									exit
								fi
							;;
						-1)
								echo "An unexpected error has occurred."
							;;
				esac			   	
	          ;;
	  TPL)  echo "(3-${pandocCMD}-${pandocPROC}) Select the Default Template File"
	   		   tplFILENEW=`zenity --file-selection  --filename="${PWD}/${TPL}/" --title="Select a Default PANDOC Template File"`
			   case $? in
						 0)
								echo "\"$tplFILENEW\" selected."
								TEMPLATEpath=${tplFILENEW%/*}    # get the part before the last slash
								TEMPLATEext=${tplFILENEW##*/}    # get the part after the last slash
			  					EXTENSIONtpl=${TEMPLATEext##*.}  # get part after the last dot "."
			  					TEMPLATE=${TEMPLATEext%.*}       # get the part before the last dot

								if [ "$TEMPLATE" == "tpldefault" ]; then
  									echo "Used existing '${TEMPLATEext}'"
  								else 
  									echo "Copy '${tplFILENEW}' to 'tpldefault.${EXTENSIONtpl}'"
  									cp "${tplFILENEW}"  "${TEMPLATEpath}/tpldefault.${EXTENSIONtpl}"
  								fi
							;;
						 1)
								echo "(3-${pandocCMD}-${pandocPROC}): No Template file selected"
							;;
						-1)
								echo "(3-${pandocCMD}-${pandocPROC}): An unexpected error has occurred."
							;;
				esac			   	
	            ;;
	   Remove)  echo "Remove Project Files: $pandocCMD "
				pandocPROJECT=`zenity --title="Delete PANDOC Project Folder" --filename="$projectDIR" --file-selection --directory`;
				Answer=`zenity --list \
				--title="Select Answer for Remove" \
				--column="Answer" --column="Operation" \
				"Yes" "Remove all project files" \
				"No" "Cancel" `
	            echo "Remove Check: $Answer"
				case $Answer in
	              Yes) echo "Perform Remove Project Files"
	                   rm -r $pandocPROJECT
	                   echo "All files deleted '$pandocPROJECT'"
	              ;;
				  No) echo "Cancel"
				  ;;
				esac
	            ;;

	   Quit) exit
	       ;;
	esac
	# case $pandocCMD in
	# esac
	echo "-----------------------------------------------------"
done
# -----Demo Code-----------------------------------
# MYVAR="usr/var/cpanel/users/joebloggs.dotDNS9=domain.com.pdf" 
# NAME=${MYVAR%.*}  # get the part before the last dot "."
# NAME=${MYVAR%%.*} # get the part before the first dot "."
# NAME=${NAME##*/}  # get the part after the last slash "/"
# NAME=${NAME#*/}   # get the part after the first slash "/"
# ------------------------------------------------
# Extract filename="/home/myuser/Documents/mypaper.md"
# NAME="/home/myuser/Documents/mypaper"
# output="/home/myuser/Documents/mypaper_tp4twocolumn.odt"
# ------------------------------------------------
	
#t=0
#case $pandocCMD in
#for iFile in $sdapsIMPORT
#do
#   t=$(( t + 1 ))
#   echo "$t : Conversion of scanned File $iFile"
#    * ) echo "else"
#   esac
#done
#if [ "$x" == "valid" ]; then
#  echo "x has the value 'valid'"
#fi
#VAR=""
#if [ -z "$VAR" ]; then
#    echo "VAR is empty"
#fi

