TODO: Write database management tools to manipulate the data in www/data:
- add: will take a file containing a JSON or MARC record, or the 
properties for the new item at the command line. If nothing is provided, 
will prompt user for each name. Do it a little bit more smartly in a TTY, 
let the user navigate quickly between fields with arrows and tabs.
- update: will take a key and changed information, same input as add. Should
prompt for changes in the same way if nothing specified.
- delete: will take a key and delete it from the data files, including
all indexes.

TODO: Write a tool which can import from Z39.50 databases. I believe there
are some npm libraries out there for it already. It should:
1) Store the configuration for a number of servers in a file (these servers
can be 'disabled' without removing their configurations).
2) Search by ISBN as well as keyword/title/subject, etc.
3) Allow for a batch search as well.
2) For each entry searched, it will process that search against *all*
of the servers in the configuration, and return a list of results.
