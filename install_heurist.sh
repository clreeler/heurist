#! /bin/sh

# install_heurist_ubuntu.sh: installation script for Heurist only on Ubuntu
# Note: run install_prerequisities_ubuntu.sh first to install php packages, MySQL, SpatialLite etc.

# @package     Heurist academic knowledge management system
# @link        http://HeuristNetwork.org
# @copyright   (C) 2005-2014 University of Sydney
# @author      Ian Johnson     <ian.johnson@sydney.edu.au>
# @license     http://www.gnu.org/licenses/gpl-3.0.txt GNU License 3.0
# @version     3.2

# Licensed under the GNU License, Version 3.0 (the "License"); you may not use this file except in compliance
# with the License. You may obtain a copy of the License at http://www.gnu.org/licenses/gpl-3.0.txt
# Unless required by applicable law or agreed to in writing, software distributed under the License is
# distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied
# See the License for the specific language governing permissions and limitations under the License.

# -------------PRELIMINARIES ---------------------------------------------------------------------------------------------

echo -e "\n\n\n\n\n\n\n\n\n\n\n\n"
echo Checking parameters and availability ...
echo

if [ -z $1 ]
   then
      echo -e "\n\n"
      echo "Please supply version eg. h3.x.x-alpha or h3-alpha, h3-beta, h3-latest (this MUST exist as a tar.bz2 file "
      echo "on HeuristScholar.org/HEURIST/DISTRIBUTION or script will not download the Heurist code package)"
      exit
   fi

# Test download package is valid before we get half way and can't find it ...
curl --range 0-100 http://heuristscholar.org/HEURIST/DISTRIBUTION/$1.tar.bz2 > /dev/null 2>&1

rc=$?
if [ $rc -ne 0 ]
     then
        echo -e "\n\n"
        echo "The version parameter you supplied does not point to a Heurist installation package"
        echo "Please check for the latest version at http://heuristscholar.org/HEURIST/DISTRIBUTION"
        echo "The parameter should be eg. h3.2.0-beta as given - DO NOT include the url path or .tar.bz2"
        exit
     fi

echo
echo "----------------------- Installing Heurist Version 3 ---------------------------"
echo
echo "Progress and errors go to terminal, other messages to a file called heurist_install.log"
echo "in the current directory"
echo
echo ----- Now installing Heurist code and directories -----------------------------------

# added 24/2/14. Everything now lives in /var/www/html/HEURIST with appropriate simlinks

echo "Changing to /var/www/html and creating HEURIST directory"

# apache on Ubuntu used to install at /var/www, now it installs at /var/www/html

# ensure html directory exists - if this is not apache web root, Heurist will be installed but
# not accessible at hte web root address. Relatively easy for sysadmin to fix.
cd /var/www
sudo mkdir /var/www/html
cd /var/www/html

sudo mkdir HEURIST
sudo mkdir /var/www/html/HEURIST/HEURIST_SUPPORT
sudo chown -R www-data:www-data /var/www/html/HEURIST/

echo -e "Fetching Heurist code from HeuristScholar.org"
sudo wget http://heuristscholar.org/HEURIST/DISTRIBUTION/$1.tar.bz2
sudo tar -xjf $1.tar.bz2
sudo rm $1.tar.bz2
sudo mv $1/ /var/www/html/HEURIST/h3

# Simlink Heurist as heurist and as h3 from the root web directory
# do both /var/www and /var/www/html for good measure
cd /var/www
sudo ln -s html/HEURIST/h3 h3
sudo ln -s html/HEURIST/h3 heurist
cd /var/www/html
sudo ln -s HEURIST/h3 h3
sudo ln -s HEURIST/h3 heurist

cd /var/www/html/HEURIST/HEURIST_SUPPORT

# Note:  added sudos to wget 9/6/14 - check if needed/valid

sudo wget http://heuristscholar.org/HEURIST/DISTRIBUTION/HEURIST_SUPPORT/external.tar.bz2
sudo tar -xjf external.tar.bz2
sudo rm external.tar.bz2

sudo wget http://heuristscholar.org/HEURIST/DISTRIBUTION/HEURIST_SUPPORT/help.tar.bz2
sudo tar -xjf help.tar.bz2
sudo rm help.tar.bz2

sudo wget http://heuristscholar.org/HEURIST/DISTRIBUTION/HEURIST_SUPPORT/exemplars.tar.bz2
sudo tar -xjf exemplars.tar.bz2
sudo rm exemplars.tar.bz2

echo "Heurist unpacked"

cd /var/www/html/h3/

echo -e "\n\n"
echo "Creating directories and setting permissions"

sudo mkdir /var/www/html/HEURIST/HEURIST_FILESTORE
sudo mkdir /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit
sudo chown -R www-data:www-data /var/www/html/HEURIST/

sudo cp -r /var/www/html/HEURIST/h3/admin/setup/rectype-icons/ /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit
sudo cp -r /var/www/html/HEURIST/h3/admin/setup/smarty-templates/ /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit
sudo cp -r /var/www/html/HEURIST/h3/admin/setup/xsl-templates/ /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit

sudo mkdir /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit/filethumbs
sudo mkdir /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit/generated-reports
sudo mkdir /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit/hml-output
sudo mkdir /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit/html-output
sudo mkdir /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit/scratch
sudo mkdir /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit/settings
sudo mkdir /var/www/html/HEURIST/HEURIST_FILESTORE/H3Sandpit/backup

sudo chown -R www-data:www-data /var/www/html/HEURIST/HEURIST_FILESTORE
sudo chmod -R 755  /var/www/html/HEURIST/HEURIST_FILESTORE

# ------------- Create H3Sandpit database --------------------------------------------------

# 23 July 2014: H3Sandpit now created automatically by Heurist at first access attempt
# Directories are, however, created by this script

# echo
# echo Please enter the root password for MySQL at the following prompt
# echo
# sudo mysql -uroot -p < /var/www/html/HEURIST/h3/admin/setup/dbcreate/buildExampleDB.sql

# ------------------------------------------------------------------------------------------

echo -e "\n\n\n\n\n\n"

echo "---- Heurist installed in /var/www/html/HEURIST/h3 -------------------------------------------"
echo
echo "Simlinks in /var/www and /var/www/html allow Heurist to be accessed as h3 or heurist in the web root"
echo
echo "NOTE:"
echo
echo "There is normally limited space on /var/www, so you may wish to move HEURIST_FILESTORE from"
echo "its current location - /var/www/html/HEURIST/HEURIST_FILESTORE - to a location with plenty "
echo "of space allocated, such as /srv or /data, and add a simlink to this location in /var/www/html/HEURIST "
echo
echo "CONFIGURATION:"
echo
echo "Edit /var/www/html/HEURIST/h3/configIni.php to set your MySQL root user password - twice, clearly documented in file"
echo
echo "You can do this by pasting the following at the command line (may need to change nano to pico on some systems):"
echo
echo "           sudo nano /var/www/html/HEURIST/h3/configIni.php"
echo