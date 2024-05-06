# Tanda Player (NOT YET READY FOR USE - IN DEVELOPMENT)

## Overview

This is a standalone web page app that provides a simple way to DJ at a Milonga or a Practica.  No information is sent to a server - all files are local to your PC.

The application requests access to a music folder which once set, is scanned for all music files and their details are added to a local database.  You can add or change 
some of the classifications of each track at any time.  

When playing the DJ can select which output devices to use to send music to their amplifier/speakers and which to use for headphones.  When headphones are configured by the user, a symbol appears next to all songs and cortinas allowing the DJ to pre-listen to anything.

## The Philosophy

Milonga's and some Practicas play music in Tandas - a collection of typically 3 or 4 songs - that the DJ puts together around some common properties such as the Orchestra, the year, the mood and tempo etc.

The Tanda Player app allows the DJ to build a library of Tandas over time of any size, music style - anything the DJ wants as a Tanda.

When DJing, the DJ creates a playlist, defines the sequence such as Tango, Tango, Waltz, Tango, Tango, Milonga and repeat.  Then they decide whether to use Cortinas and if so which set of songs to use - Jazz, Salsa or whatever they have set up.  The DJ then simply searches through their collection of Tandas and adds them to a scratch pad for consideration.  As they go, they can move tandas from the scratch pad onto the playlist or take them back off onto the scratch pad or just remove them altogether from the playlist.  Within the constraints of the music style sequence, the DJ can move their tandas around too.

The player will play through the tandas managing the sound levels, silences between songs and the injection of the Cortinas including fading out after a pre-determined playing time whilst showing the DJ the approximate time when each Tanda will play to help with planning out the evening.

Each tanda is, by default, shown as a summary but any tanda can be opened up to see the actual track details within.  This helps keep many tandas on the screen at the same time allowing the DJ to see the artists and orchestras they have already used.

As tandas are added and removed from the playlist or scratch pad, the app will highlight those containing the same songs or simply just the same song titles to help alleviate accidental duplication.

The finding of tandas is supported through simple searches which are tolerant of spelling mistakes and also some quick pre-defined search results such as a list of favourites or recently added etc.

## Going deeper

If the DJ wishes, they can start to add tags to their songs to indicate mood or music styles such as stocato playing.  The searches can then search for songs with similar tags so that once a DJ has found a song, the app can show similar songs which may help to construct new tandas.

Once more information is available, the Auto-DJ feature can be used to create whole or starter playlists.  This is ideal for a quick Sunday afternoon Practica etc. ensuring that playlists are always new and varied without any additional work by the DJ.  These playlists can then be modified as normal should the DJ wish to play something in particular.

## In addition

The app can produce a display board page which if moved to a separate display monitor attached to the computer, shows the dancers what's playing.

In addition the DJ can install a program called MQTT which is a message broker which, when the Tanda Player app opens it looks for, and if found messages are sent to this broker describing what is playing now and next. An additional dedicated display board web page can then be opened and connected to the DJ's PC using the WiFi connection and allows display boards to be set up around the venue.

If there is no local WiFi available the DJ can set their mobile phone as a WiFi hotspot and use that.

# Legacy Support

If you have an Old Tanda Player library, the entire contents can be loaded into this new Tanda Player importing all your tandas, song titles, artists and music classifications and set up all the old playlists.

# Technical Info

This application is built on two huge projects:
- Howler.js - the music player
- FFmpeg WASM - an amazing port of the full FFmpeg application for use in web pages!

Using the Web's FileSystemAPI the web page is able to request access to your hard disk or USB flash drives and from there find all the music files.

Each file is then passed to FFmpeg to extract all the ID3 tags (title, artist etc.) and analyse the leading and trailing silences and the mean and maximum volumes.  There is a memory issue with the FFmpeg WASM file in that if you keep running commands it runs out of memory and crashes the web page!  To get around this, every 100 commands the Tanda Player tries to re-create the FFmpeg instance leaving the operating system and browser to clear up the mess but hopefully no out of memory errors will occur.

The playlist is constructed from these tracks and they are fed to Howler.js to play as required.
