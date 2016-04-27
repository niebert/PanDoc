#!/bin/bash
clear
# VARIABLE DEFINITION for DIRECTORIES
projectDIR="./projects"
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
REL="./"
#-----BibTeX: Path and Files-----
bibbaseDIR="${REL}bib"
tplbaseDIR="${REL}tpl"
bibDIR="${bibbaseDIR}/data"
bibDEFAULT="${bibDIR}/biblio.bib"
bibFILE="${bibDEFAULT}"
cslDIR="${bibbaseDIR}/csl"
cslDEFAULT="${cslDIR}/apa5.csl"
cslFILE="${cslDEFAULT}"
#-----Templates: Path and Files----
tplDIR="${tplbaseDIR}/reveal"
tmpDIR="$inputDIR/tmp"
inputDIRFORMAT="$inputDIR/wiki"
echo "Startup PANDOC Project Directory: $pandocPROJECT"
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
			  "BibTeX" "Select BibTeX" \
			  "View" "Generated Output - Display" \
			  "Remove" "PANDOC Project Files" \
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
	   Debug)  pandocNEWDIR="newproject"
	           NAMEext="myinput.md"
	           pandocPROJECT="$baseDIR/$pandocNEWDIR"
	           echo "(DEBUG-1-${pandocCMD}) ${pandocPROJECT}"
	           EXTENSION="md"
	           inputFORMAT="md"
	           inputFILE="${pandocPROJECT}/${NAMEext}"
	          ;;
	   Create) pandocNEWDIR=`zenity --title="New PANDOC Project Directory" --entry --entry-text="newproject"  text="New PANDOC Folder Name"`
	           pandocPROJECT="$baseDIR/$pandocNEWDIR"
	           echo "(1-${pandocCMD}) ${pandocPROJECT}"
	           mkdir "${pandocPROJECT}"
	           ## Copy Files into Directory perform in Step (2)
	          ;;
	   Input) echo "(1-${pandocCMD}) Select Input File "
	   		  if [ "$pandocPROJECT" == "xxx" ]; then
				  echo "PanDoc Project was undefined! set to default '${projectDIR}'."
				  pandocPROJECT="${projectDIR}"
			  fi
			  inputFILE=`zenity --file-selection --title="Select a PANDOC Input File" --filename="${pandocPROJECT}" `
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
	  Output)  echo "Format $pandocCMD selected"
	   		  echo "Selelect $pandocCMD Format for Document"
	   		  outputFORMAT=`zenity --list \
				--title="Select Answer for Remove" \
				--column="Type" --column="Operation" \
			  "reveal" "Reveal JS Presentation" \
			  "odt" "Libre Office Format" \
			  "docx" "Select BibTeX" \
			  "latex" "Edit Source File" \
			  "beamer" "LaTeX Beamer Presentation" \
			  "html" "HTML for Browsers" \
			  "wiki" "WikiMedia Output" \
			  "md" "Mark Down Export"`
	            
	            echo "Output format: $outputFORMAT"
				#inputDIRFORMAT="$inputDIR/$inputFORMAT"
	            ;;
	  BibTeX)  echo "Select the BibTeX-File for Project by $pandocCMD"
	   		   bibFILENEW=`zenity --file-selection --title="Select a PANDOC BibTeX File"`
			   case $? in
						 0)
								echo "\"$bibFILENEW\" selected."
								BIBLIOext=${bibFILENEW##*/}  # get the part after the last slash
			  					if [ "$BIBLIOext" == "biblio.bib" ]; then
  									echo "Used existing 'biblio.bib'"
  								else 
  									echo "Copy '${bibFILENEW}' to 'biblio.bib'"
  									cp "${bibFILENEW}"  "${bibDIR}/biblio.bib"
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
	    Convert)  echo "(1--${pandocCMD}) Convert Project: $pandocCMD "
	    	  ;;
		Editor)  echo "(1--${pandocCMD}) Start Editor for Project: $pandocCMD "
	    	  ;;
		View)  echo "(1--${pandocCMD}) View Generated File for Project: $pandocCMD "
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
	   *) echo "Exist PANDOC Zenity";exit;;
	esac
	################################################################
	# -2- PERFORM OPERATION IN PROJECT DIR
	################################################################
	echo "(2) PANDOC Project Processing: $pandocPROJECT "
	# Select the PANDOC Input document
	case $pandocPROC in
	   Create) echo "(2-${pandocPROC}) create or select an default input file"
	   			Answer=`zenity --list \
				--title="Do want to select an input file?" \
				--column="Answer" --column="Operation" \
				"SELECT" "Select an Input File for the Pandoc project." \
				"NEW" "Enter a default filename for NEW Pandoc project" `
	            echo "(2-${pandocPROC}-${Answer}) CREATE Input File for ${pandocPROJECT}: $Answer"
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
									
							*)  echo "(2-${pandocPROC}-${EXTENSION}) "
								echo "ERROR-01: No Valid Extension in '$pandocCMD' as Input Format"	
								
							 ;;
						esac # case EXTENSION
						echo "(2-${pandocCMD}-${Answer})  Input File: $inputFILE "
	           		;;
	           esac # case Answer
	           echo "(2-${pandocPROC}) Create Finished NAME=${NAMEext}  inputFORMAT=${EXTENSION}"
	   		;;
	   Editor)  echo "(2-${pandocPROC}) Check Scanned Files execute PANDOC recognize: $pandocCMD "
	           geany $inputFILE
	            ;;
	  Convert)  echo "(2-${pandocPROC}) Run PANDOC - ${inputFORMAT}2${outputFORMAT}-$pandocCMD "	   
	            echo "Selelect $pandocCMD Format for Document"
	   		  	outputFORMAT=`zenity --list \
					--title="Select OUTPUT Format" \
					--column="Type" --column="Output Format" \
					  "reveal" "Reveal JS Presentation" \
					  "odt" "Libre Office Format" \
					  "docx" "Select BibTeX" \
					  "latex" "Edit Source File" \
					  "beamer" "LaTeX Beamer Presentation" \
					  "html" "HTML for Browsers" \
					  "dzslides" "DZ Slides Presentation" \
					  "wiki" "WikiMedia Output"`
	            
	            echo "Output format: $outputFORMAT"
				
	            converter="${inputFORMAT}2${outputFORMAT}"
	            #sh converter/${converter}/${converter}.sh $inputFILE $tplFILE $bibFILE $cslFILE
	            echo "sh converter/${converter}/${converter}.sh $inputFILE $tplFILE $bibFILE $cslFILE "
	            case $inputFORMAT in
	            	md)
	            		echo "(2-IN) Input Format: $inputFORMAT "
	            		INtype="markdown"
	            		;;
	            	wiki)
	            		echo "(2-IN) Input Format: $inputFORMAT "
	            		INtype="mediawiki"
	            		;;
	            	*) echo "(2-IN) Format $inputFORMAT is not allowed!"
	            		echo "Exit $0 - inputFORMAT=$inputFORMAT "
	            		exit
	            		;;
	            esac
	            echo "(2-${pandocCMD}) Output Format: '$outputFORMAT' "	
	            case $outputFORMAT in
	            	reveal) ##### REVEAL PRESENTATION ########
	            		echo "(2-OUT) Output Format: $outputFORMAT "
	            		#theme="beige"
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
	            
	            		echo "Reveal Theme: '${theme}' selected"
						outEXTENSION="html"
	            		OUTtype="html5"
	            		#template="${tplbaseDIR}/${outputFORMAT}/default.${outputFORMAT}"
	            		template="${tplbaseDIR}/${outputFORMAT}/tpldefault.${outEXTENSION}"
	            		inputNOEXT=${inputFILE%.*}  # get the part before the last dot "."
	            		outfile="${inputNOEXT}_${outputFORMAT}.${outEXTENSION}"
 						echo "--------------------------------------------"
						echo "PROJECT:      ${pandocPROJECT}"
						echo "Reveal Theme: ${theme} "          
						echo "Input File:   ${inputFILE}"
						echo "Output File:  ${outfile}"
						echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "--------------------------------------------"
						#pandoc -S "--reference-${outEXTENSION} ${template}" --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}
						pandoc -t ${OUTtype} --mathjax --template=${template}  --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes --standalone --section-divs --variable theme="${theme}" --variable transition="slide" ${inputFILE} -o ${outfile} --csl ${cslFILE}
						#-------------SED Template Correction--------------------
						#---- sed corrects an replace error in css path .../css/"beige".css by .../css/beige.css
						eval "sed 's/css\/\\\"${theme}\\\"/css\/${theme}/g'  ${outfile} > ${pandocPROJECT}/tmp.txt" 
						mv ${pandocPROJECT}/tmp.txt  ${outfile} 
						callStr=" pandoc -t ${OUTtype} --template=${template}  --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes --standalone --section-divs --variable theme=\"${theme}\" --variable transition=\"${theme}\" ${inputFILE} -o ${outfile} --csl ${cslFILE}"
						#$callStr 
	            		callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "--------------------------------------------"
						
					;;
	            	odt) ##### LIBREOFFICE ODT ######################
	            		echo "(2-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="$outputFORMAT"
	            		OUTtype="$outputFORMAT"
	            		#template="${tplbaseDIR}/${outputFORMAT}/default.${outputFORMAT}"
	            		template="${tplbaseDIR}/${outputFORMAT}/tpl4paper.${outputFORMAT}"
	            		inputNOEXT=${inputFILE%.*}  # get the part before the last dot "."
	            		outfile="${inputNOEXT}.${outEXTENSION}"
 						echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inputFILE}"
						echo "Output File: ${outfile}"
						echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						#pandoc -S "--reference-${outEXTENSION} ${template}" --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}
						callStr="pandoc -S --reference-${outEXTENSION} ${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}"
						$callStr 
	            		callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"

	            		;;
	            	latex) #### LATEX ######################
	            		echo "(2-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="tex"
	            		template="${tplbaseDIR}/${outputFORMAT}/tpl4paper.${outEXTENSION}"
	            		inputNOEXT=${inputFILE%.*}  # get the part before the last dot "."
	            		##outfile="${inputNOEXT}.${outEXTENSION}"
 						outfilePDF="${inputNOEXT}.pdf"
 						outfile="${inputNOEXT}.tex"
 						echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inputFILE}"
						echo "Output File: ${outfile}"
						echo "Output PDF:  ${outfilePDF}"
						echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						pandoc -s --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -o ${outfile} ${inputFILE} --csl ${cslFILE}
						#callStr="pandoc -S --reference-${outEXTENSION} ${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfilePDF} ${inputFILE} --csl ${cslFILE}"
						callStr="pandoc -N --template=${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes --variable mainfont=\"Palatino\" --variable monofont=\"Consolas\" --variable fontsize=12pt --variable version=1.0 ${inputFILE} --latex-engine=xelatex --toc -o ${outfile}"
						echo $callStr 
	            		$callStr 
	            		callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
					;;
	            	beamer) #### BEAMER ######################
	            		echo "(2-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="pdf"
	            		OUTtype="${outputFORMAT}"
	            		inputNOEXT=${inputFILE%.*}  # get the part before the last dot "."
	            		outfile="${inputNOEXT}_${outputFORMAT}.${outEXTENSION}"
 						echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inputFILE}"
						echo "Output File: ${outfile}"
						# echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						callStr="pandoc -S --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}"
						#pandoc -t beamer SLIDES -o example8.pdf
	            		$callStr 
	            		callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
	            		;;
	            	docx) #### DOCX ######################
	            		echo "(2-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="$outputFORMAT"
	            		OUTtype="$outputFORMAT"
	            		template="${tplbaseDIR}/${outputFORMAT}/tpldefault.${outputFORMAT}"
	            		inputNOEXT=${inputFILE%.*}  # get the part before the last dot "."
	            		outfile="${inputNOEXT}.${outEXTENSION}"
 						echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inputFILE}"
						echo "Output File: ${outfile}"
						echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						echo pandoc -S --reference-${outEXTENSION} ${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}
						#pandoc -S --reference-${outEXTENSION} ${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}
						callStr="pandoc -S --reference-${outEXTENSION} ${template} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}"
						$callStr 
	            		callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
	            		;;
	            	html) #### HTML with pandoc.css ######################
	            		echo "(2-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="html"
	            		cssFILE="pandoc.css"
 						echo "Copy '${cssFILE}' to project folder ${pandocPROJECT}"
	            		cp "${tplbaseDIR}/${outputFORMAT}/${cssFILE}" "${pandocPROJECT}"
	            		inputNOEXT=${inputFILE%.*}  # get the part before the last dot "."
	            		outfile="${inputNOEXT}.${outEXTENSION}"
	            		echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inputFILE}"
						echo "Output File: ${outfile}"
						#echo "Template:        ${template}"
						echo "CSS-File:        ${cssFILE}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						#pandoc -s -S --toc -c pandoc.css -A footer.html README -o example3.html
	            		#pandoc -s -S --toc --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}
	            		#pandoc -s -S --toc  -c ${cssFILE} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -o ${outfile} ${inputFILE} --csl ${cslFILE}
	            		callStr="pandoc -s -S --toc  -c ${cssFILE} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -o ${outfile} ${inputFILE} --csl ${cslFILE}"
	            		$callStr 
	            		callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
	            		;;
	              wiki) #### MEDIAWIKI ######################
	              		echo "(2-OUT) Output Format: $outputFORMAT "
	            		outEXTENSION="${outputFORMAT}"
	            		inputNOEXT=${inputFILE%.*}  # get the part before the last dot "."
	            		outfile="${inputNOEXT}.${outEXTENSION}"
	            		OUTtype="mediawiki"
	            		echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inputFILE}"
						echo "Output File: ${outfile}"
						echo "Output Type: ${OUTtype}"
						#echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						callStr="pandoc -s -S --toc --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}"
	            		$callStr 
	            		callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"
	            		
	              		;;
	            	dzslides) #### DZSLIDES ######################
	            		echo "(2-OUT) Output Format: ${outputFORMAT} "
	            		outEXTENSION="html"
	            		OUTtype="${dzslides}"
	            		#template="${tplbaseDIR}/${outputFORMAT}/tpl4paper.${outputFORMAT}"
	            		inputNOEXT=${inputFILE%.*}  # get the part before the last dot "."
	            		outfile="${inputNOEXT}_${outputFORMAT}.${outEXTENSION}"
 						echo "-------------------------------------------"
						echo "PROJECT:     ${pandocPROJECT}/"
						echo "Input File:  ${inputFILE}"
						echo "Output File: ${outfile}"
						#echo "Template:        ${template}"
						echo "BibTeX-File:     ${bibFILE}"
						echo "Bib Style Sheet: ${cslFILE}"
						echo "-------------------------------------------"
						#pandoc -S "--reference-${outEXTENSION} ${template}" --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes -t ${OUTtype} -o ${outfile} ${inputFILE} --csl ${cslFILE}
						# pandoc -s --mathml -i -t dzslides SLIDES -o example16a.html
						callStr="pandoc -s  --mathml -i -t ${OUTtype} --bibliography ${bibFILE} -f ${INtype}+simple_tables+footnotes  -o ${outfile} ${inputFILE} --csl ${cslFILE}"
						$callStr 
	            		callStr="$(echo ${callStr} | sed 's/\//\\\\/g')"
						echo "$callStr" > "./win_${outputFORMAT}.bat"
						echo "PanDoc ${outputFORMAT}-Conversion Done"
						echo "-------------------------------------------"

	            		;;
	            	*)  echo "(2-OUT) Output Format: $outputFORMAT is not allowed"
	            	    exit
	            	    ;;
	            esac
	            zenity --info --text "PANDOC Convert\n--------------\nConvert File from $inputFORMAT to $outputFORMAT done!"

	            ;;
	   View) echo "View PANDOC Output-File: $pandocPROJECT "
	            NAMEext=${inputFILE##*/}  # get the part after the last slash
				EXTENSION=${NAMEext##*.}  # get part after the last dot "."
				case $outputFORMAT in
	            	reveal) echo "Firefox View ${outputFORMAT}-Presentation in HTML"
	            		echo "firefox $pandocPROJECT/${NAME}_${outputFORMAT}.html"
	            		firefox "$pandocPROJECT/${NAME}_${outputFORMAT}.html"
	            		;;
	            	dzslides) echo "Firefox View ${outputFORMAT}-Presentation in HTML"
	            		echo "firefox $pandocPROJECT/${NAME}_${outputFORMAT}.html"
	            		;;
	            	html) echo "Firefox View in HTML"
	            		echo "firefox $pandocPROJECT/${NAME}.html"
	            		;;
	            	odt) echo "LibreOffice Writer $pandocPROJECT/${NAME}.odt"
	            		echo "libreoffice  --writer -o $pandocPROJECT/${NAME}.odt"
	            		libreoffice  --writer -o $pandocPROJECT/${NAME}.odt
	            		;;
	            	docx)  echo "LibreOffice Writer $pandocPROJECT/${NAME}.docx"
	            		echo "libreoffice  --writer -o $pandocPROJECT/${NAME}.docx"
	            		libreoffice  --writer -o $pandocPROJECT/${NAME}.docx
	            		;;
	            	latex) echo "LaTeX View in PDF"
	            		echo "evince $pandocPROJECT/${NAME}.pdf"
	            		evince $pandocPROJECT/${NAME}.pdf
	            		;;
	            	*) echo "Format $outputFORMAT is not allowed!"
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
# MYVAR="usr/var/cpanel/users/joebloggs:DNS9=domain.com:sdsd=ss" 
# NAME=${MYVAR%:*}  # get the part before the last colon
# NAME=${MYVAR%%:*} # get the part before the first colon
# NAME=${NAME##*/}  # get the part after the last slash
# NAME=${NAME#*/}   # get the part after the first slash
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

