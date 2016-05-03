#!/bin/sh
echo "PDF2PNG-Converter with ImageMagick"
echo "----------------------------------"
echo "Enter directory for file modification"
read Input_directory
echo "Enter PDF File"
read FilePDF
echo "Enter Number of Slides"
read MAXSLIDES
cd $Input_directory
#for file in *.pdf; do 
#	#sips -s format png $file --out "${file%\.*}".png && rm -f "$file"; 
#	convert -density 300 -depth 8 -quality 85 source.pdf[1-5] test.png
#done
COUNTER=0
while [  $COUNTER -lt $MAXSLIDES ]; do
	let COUNTER=COUNTER+1 
	echo "Create PNG for Slide $COUNTER "
	convert -density 300 -depth 8 -quality 85 ${FilePDF}[${COUNTER}] outtmp.png
	mv outtmp.png "img${COUNTER}.png"
done
             			
