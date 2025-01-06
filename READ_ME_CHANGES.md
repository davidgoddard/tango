# Tanda Player Lite #

## Tags ##

After loading a file from disk it will have the basic metadata stored as tags: artist, title.  From previous tanda Players it will obtain any classifiers too.

Special labels will be reserved: artist, title, style.

Each track is stored in the database with a list of all tags.

All tags are assumed to be strings and searchable.  To search a tag, simply enter the tag name followed by a colon and then the search text. 

For multiple field searches, enter "a,b,c:search-text" which will search in tags a b and c.

To search across all fields, simply omit the labels and the colon - this is the default search.

Right-click on any track and the editor will appear regardless of where in the app it is rendered.

All previously known tag labels will be listed with a field next to them.  A blank label and field will be provided allowing new values to be added.  As soon as a new label is encountered, it will be made available in all future edits. 

A configuration screen could enable the removal of unwanted labels.

In the database the labels will be stored as an object.

When searching, if no labels are given all fields will be joined for all records in the database when searching.

Label values will be stored in a trie in memory as 10s of thousands of strings should not exceed usable memory and will provide fast searching.

