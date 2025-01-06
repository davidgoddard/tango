# Tanda Player Lite

A simple web app for Tango playing DJs that understands tandas and cortinas and the music styles.

## Overview

The Tanda Player is a music player based on Tandas rather than just tracks.  Over time you can build a library of great tandas and you add these into playlists when needed.  Each tanda may be associated with cortinas and when playing the tanda, Tanda Player will fade out the cortina after some pre-defined period automatically and start the tanda's songs.

The application is a single page split into 3 columns; a search area, a scratch-pad area and the playlist area.

You can search for tandas, then either drag them into the scratch-pad so that you do not forget about them, or you can drag them straight into the playlist provided it matches the music style (Tango or Milona etc) of the one being replaced.  Tandas replaced in the playlist are moved to the scratch-pad just in case you want to do something else with it.  Similarly, any tanda or song already on the scratch-pad can be swapped for something in the playlist at any time.

Similarly, you can search for songs, then expand any existing tanda in the playlist or the scratch-pad area and drag/drop the found song to replace one in the tanda.  Similarly too the replaced song is moved to the scratch-pad just in case.

The scratch pad can have many tabs created, allowing you to find some good Cumprasitas or known favourites for a given venue.  You might also add a tab of potential nuevo just in case you feel the audience would like a change from traditional.

The state of the app; playlists and scratch-pads, are automatically saved and so you can create the scratch-pads or start the playlist at home and then continue with them once at the venue.

Within the scratch-pad area it is possible to create brand new tandas and drag/drop tracks into them and then save these into your collection.  

The playlist is typically defined to follow a sequence such as 4 Tango, 4 Tango, 3 Waltz/vals, 4 Tango, 3 Milonga or whatever, and you can click a single button to extend the playlist with placeholders for a complete sequence.  Then you can drag songs or tandas in to fill them out or replace the placeholders.  This way the musical style sequence is easily maintained.

Cortinas can be enabled or disabled on a playlist at any time, and a new set of cortinas can be applied to a whole playlist initially randomly allocating cortinas to each tanda.  In addition each tanda is associated with its own cortina (the last one you used) and this can be swapped individually too.

## Getting started

### Permissions

The application, being a web page, must request access permission to your sound devices (speakers and headphones) and also for you file system to be able to read and play your music files.  Typically, these permissions persist for a while and the next time you open the app, you may not be prompted.

### Loading the music files

Via the settings panel you identify the folder in which the music resides.  There must be a folder with cortinas and a folder with the main music in it.  The names of these sub-folders must be specified and then the file system can be scanned to find suitable files.

By default the files are just loaded up and the "title" of the song is taken to be the file name.  However, if you have more time at hand, you can instead make the system read every file which produces the following:
 - It finds the "title", "artist", "year" and "notes" ID3 tags
 - It identifies any leading or trailing silence in the recording
 - It assesses the average loudness of the recording.

 This is achieved by using FFmpeg which can read most file formats and identify the ID3 tags etc.

 The system will use the average loudness to identify the quietest songs in your collection and then turn down the volume for all tracks to match this one and so achieves a constant sound level whilst playing the songs.  If you have songs that are too quiet you might want to consider using some normalisation on them and re-loading the app but most sound systems can easily produce enough sound for a Milonga.

 The details of each song are stored in a database and every song and tanda can be edited so that titles, artists, years and notes etc. can all be added or corrected for any song but this information is not written back over the original file but will be used whenever that song is shown in the app.

### Creating tandas

Use your spare time to create tandas using the scratch-pad.  Open a new tanda and expand it to contain the required number of song place-holders.  Then search for songs and drag/drop them into place and save the tanda.  

Tandas are found by using the searches and any song that matches your search that is contained in a tanda results in that tanda matching and being shown.

Tandas created this way can contain any mix of music styles but if all songs added are of the same style, the tanda is treated as this style and can only be swapped for other tandas of that style.  This means you cannot accidentally drop a tango tanda over a waltz tanda.



Each song is automatically trimmed of any leading and trailing silence making song spacings consistent and the sound levels are normalised meaning no sudden loud songs or quiet ones.

Playlists may be constrained to a sequence of music styles such as Tango,Tango,Waltz/Vals,Tango,Tango,Milonga and the Tanda Player will only allow suitable songs or tandas to be moved around protecting the playlist from simple mistakes.

Users of the original Tanda Player may point the Tanda Player Lite at the folder where the original library files are stored along with the music and it will import all the song details and classifications, all the tandas and playlists etc. 

### Saving Tandas and Playlists

By default the system will save all tandas you create.  When tandas are in the scratch-pad you can click a delete button to remove them permanently.

By default all changes you make to the playlist are saved immediately.

When you set up a new playlist you have to give it a unique name and in the future you can pick any previous playlist to use again but changes you make will over-write that playlist


#### To do

- Add button to delete a tanda when in scratch-pad
- auto save tanda
- auto save playlist
- add delete playlist
- add clone playlist
- add auto-dj fill a playlist
- add tabs to the scratch-pad
- use genre id3 tag for style on import
- add padlock to playlist when stopped
- add display board
- add button to stop after current song/tanda (an elipses menu)
- add whether instrumental or not?
- provide access to all ID3 tags
- allow user to decide which fields to show for a song.
- add/replace whole set of cortinas
- link cortina picker to current cortina folder and song.

#### features

- add list of recently created or updated tandas
- add code to assess style
- add code to assess tempo
- add code to assess musical properties
- add search by similar songs
- add option to search by same artist or same song title, year or style.


### DJing

Ensure you have set which computer sound-card output is to be used for playing music through the speaker system and which one to use for your headphones.

Start with a definition of your event by defining the sequence and size of each tanda in terms of tracks and music styles.  Then decide if you are using cortinas or not and if so, which set.  

Now click the button to extend the as yet empty playlist which will create one tanda for each one of the sequence you set up.

Now search your collection for songs or tandas and drag/drop onto the playlist and once all done, you can click the button to add another lot of empty tandas and repeat. 

To start playing, simply find the song or cortina to start with and click on it.  Once something is playing you cannot click on and start another song!

When a cortina is playing special controls appear allowing you to tell the system to play the whole song (because people have started dancing perhaps) or you can end the cortina now which will fade it out and then start the next song automatically.

You can stop a playlist at any time and if something is playing it will fade out.  At this point you can click any other song and it will start playing (so be careful!)

You can drag/drop tandas around the playlist provided that tanda is not the one currently playing but you can only move them to ones of the same style.  

If you must break the sequence you simply drag a tanda onto the scratch-pad which will then create an empty placeholder in your playlist.  Place holders will not play and so the system will simply skip it if it is left there.  But a place holder created this way is a generic one and you can now drop any tanda of any style onto that place holder.  Note place-holders created using the extend playlist button are marked with the type you defined for the playlist sequence, but scratch-pad created ones produced to plug gaps in the playlist are generic.

Because this app is a web page running on your laptop, switching to other music players to play songs for dance demonstrations etc. is simple and when you are ready you can simply return to the playlist and click a song to resume.


## More ideas

The purpose for creating this app was to provide a base for adding in machine-learning models to classify and group songs and classify them as tango or waltz for example.

Some features from the old full "Tanda Player" system are yet to be ported over.  These include:
- having an auto-dj capable of creating tandas or whole playlists
- 


## Tagging ##

Although not a primary goal of the player, it may be useful to attach labels to tracks whether that is dates or labels such as "fun" etc.

To help standardise on names, as more labels are added, these will appear in the editor for quick filling in.
If no label is given the text is simply appended to the notes.
Numeric fields will be separately handled to allow searching by range of values.