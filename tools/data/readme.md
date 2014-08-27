This directory is used to store data to be imported into the web
application. Specifically, the file 'items.tsv' will be imported by
the import.js script in the directory above.

It is recommended that the data file itself not be named items.tsv, but
rather items.tsv should be a symlink to the file. The actual data file can
then be version controlled in a private fork of this repository, or given
timestamps to indicate new data in a non-version-controlled system. 

The file "items.tsv" itself is in the .gitignore file, preventing it 
from being controlled in the main repository. This mechanism allows user
forks to version control their private data, without accidentally getting
overwritten by some file here.
