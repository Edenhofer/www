// Every element in the engine represents one search-engine. The element is named accordingly.
// Each one of them shell have three (3) properties:
//     * innerText (a FUNCTION which processes the html data of the web page and returns human readable information),
//     * url (a FUNCTION which returns just the language and input_language dependent URL of side for which the engine is designed),
//     * info (a ARRAY with [0] being the long name of the search engine and [1] being the short abbreviation: [0] is displayed at the options page, [1] at the popup
var engine = {
	wikipedia: {
		// Search function for Wikipedia
		innerText: function(data) {
			var begin = -1;
			var end = -1;
			var tmp = "";

			// Stripping tables from data
			data =
				data.slice(0, data.indexOf("<table")) +
				data.slice(data.indexOf("</table>"));

			// Checking for the existence of an article
			if (
				data.indexOf(
					'<div class="noarticletext">',
					data.search(new RegExp('<div id="mw-content-text"[^>]*>', "i"))
				) != -1
			)
				begin = -1;
			else {
				data = data.slice(new RegExp('<div id="mw-content-text"[^>]*>', "i"));
				begin = data.indexOf("<p>");
				// Check for interactive boxes where no useful text is available, e.g. year number - german only
				if (
					data.slice(begin + 3, begin + 18).localeCompare('<a href="/wiki/') ===
					0
				)
					begin = -1;
			}

			if (begin != -1) {
				end = data.indexOf("</p>", begin);

				// Checking for a list of options
				if (
					data.indexOf("<li>", end) != -1 &&
					data.indexOf("<li>", end) <= end + 50
				) {
					tmp = data.slice(begin);
					data = data.slice(begin, end);

					// The end is where the second </li> closes
					data += tmp.slice(
						tmp.indexOf("<li>"),
						tmp.indexOf("</li>", tmp.indexOf("<li>")) + 5
					);
					tmp = tmp.slice(tmp.indexOf("</li>", tmp.indexOf("<li>")) + 5);
					if (tmp.indexOf("<li>") != -1 && tmp.indexOf("<li>") <= 50) {
						data += tmp.slice(
							tmp.indexOf("<li>"),
							tmp.indexOf("</li>", tmp.indexOf("<li>")) + 5
						);
					}

					data = data.replace(/<li>/gi, "gorditmp01");
					data = data.replace(/<\/li>/gi, "gorditmp02");
					data += "gorditmp03";
				} else data = data.slice(begin, end);

				// Replacing anything html with nothing
				data = strip_html(data);
				data = data.replace(/\[\d+\]/gi, "");
				data = data.replace(/gorditmp01/gi, "<li>");
				data = data.replace(/gorditmp02/gi, "</li>");
				data = data.replace(/gorditmp03/gi, "<li>...</li>");

				return data;
			} else return "none";
		},
		url: function(language, input_language) {
			return "https://" + language + ".wikipedia.org/wiki/";
		},
		info: ["Wikipedia", "Wiki"]
	},

	duden: {
		// Search function for Duden a german dictionary
		innerText: function(data) {
			var begin = -1;
			var end = -1;

			if (
				data.search(new RegExp("<h2>Bedeutungs[^b]+bersicht</h2>", "i")) > 0
			) {
				begin = data.indexOf(
					"</header>",
					data.search(new RegExp("<h2>Bedeutungs[^b]+bersicht</h2>", "i"))
				);
			} else begin = -1;

			if (begin != -1) {
				data = data.slice(begin);
				// The end is where either a subheading starts (e.g. "Wiese") or the section for the word explanation is closed
				end = data.search(new RegExp("<(h3|/section)", "i"));
				data = data.slice(0, end);

				// Remove tags from <figure> elements (e.g. "Wiese")
				if (
					data.search(new RegExp("<figcaption")) > 0 &&
					data.search(new RegExp("</figcaption")) > 0
				) {
					data =
						data.slice(0, data.search(new RegExp("<figcaption"))) +
						data.slice(data.search(new RegExp("</figcaption")));
				}

				// Preserve the bullet list but remove remaining html-code
				data = data.replace(
					/<li id="b2-Bedeutung-[\d\D]"[^>]*>/gi,
					"gorditmp01"
				);
				data = data.replace(
					/<li id="b2-Bedeutung-[\d][\D]"[^>]*>/gi,
					"gorditmp02"
				);
				data = data.replace(/<\/li>/gi, "gorditmp03");
				data = strip_html(data);
				data = data.replace(/gorditmp01/gi, "<ul><li>");
				data = data.replace(/gorditmp02/gi, "<ul><li>");
				data = data.replace(/gorditmp03/gi, "</li></ul>");

				return data;
			} else return "none";
		},
		url: function(language, input_language) {
			return "http://www.duden.de/rechtschreibung/";
		},
		info: ["W&ouml;rterbuch (Duden)", "Duden"]
	},

	// Search function for Arch Linux Wiki
	archwiki: {
		innerText: function(data) {
			var begin = -1;
			var end = -1;

			// Checking for the existence of an article
			if (
				data.indexOf(
					'<div class="noarticletext">',
					data.search(new RegExp('<div id="mw-content-text"[^>]*>', "i"))
				) != -1
			)
				begin = -1;
			else {
				data = data.slice(new RegExp('<div id="mw-content-text"[^>]*>', "i"));
				begin = data.search(new RegExp("<(|/)div[^>]*>(|\n)<p>"));
			}

			if (begin != -1) {
				end = data.indexOf("</p>", begin);
				// If the article is to short it is probably a quotation, then things have to be handled differently
				if (strip_html(data.slice(begin, end)).length < 50) {
					data = data.slice(end + 4);
					begin = data.indexOf("<p>");
					// Searching for the second closing "</p>"
					end = data.indexOf("</p>", data.indexOf("</p>", begin) + 4);
					if (data.indexOf("<div", data.indexOf("</p>", begin) + 4) < end)
						end = data.indexOf("<div", data.indexOf("</p>", begin));

					data = data.slice(begin, end);

					// Saving the cursive writing
					data = data.replace(/<i>/gi, "gorditmp01");
					data = data.replace(/<\/i>/gi, "gorditmp02");
				} else data = data.slice(begin, end);

				// Replacing anything html with nothing
				data = strip_html(data);
				data = data.replace(/\[\d+\]/gi, "");

				// Saving the cursive writing
				data = data.replace(/gorditmp01/gi, "<i>");
				data = data.replace(/gorditmp02/gi, "</i>");

				return data;
			} else return "none";
		},
		url: function(language, input_language) {
			if (language == "de") return "https://wiki.archlinux.de/title/";
			else return "https://wiki.archlinux.org/index.php/";
		},
		info: ["Arch Linux Wiki", "Arch"]
	},

	// Search function for dict.cc
	dict: {
		innerText: function(data) {
			var begin = -1;
			var end = -1;
			var tmp = "";

			begin = data.search(/<tr id='tr1'>/i);

			if (begin != -1) {
				// Searching for the third occurrence of "</tr>" or the first of "</table>
				end =
					data.indexOf(
						"</tr>",
						data.indexOf("</tr>", data.indexOf("</tr>", begin) + 5) + 5
					) + 5;
				tmp = data.indexOf("</table>", begin);
				if (tmp < end) end = tmp;

				data = data.slice(begin, end);
				// Removing some headings, e.g. "</div><b>Substantive</b>"
				data = data.replace(/<\/div><b>([^<]*)<\/b>/gi, "");
				// Removing the little gray numbers
				data = data.replace(/<div[^>]*>([\d]+)<\/div>/gi, "");
				// Removing some unnecessary html code
				data = data.replace(/<dfn([^<]+)<\/dfn>/gi, "");
				data = data.replace(/<td class="td7cm(l|r)"><([^<]+)<\/td>/gi, "");

				// Preserving the table elements
				data = data.replace(/<td[^>]*>/gi, "gorditmp01");
				data = data.replace(/<\/td[^>]*>/gi, "gorditmp02");
				data = data.replace(/<tr[^>]*>/gi, "gorditmp03");
				data = data.replace(/<\/tr[^>]*>/gi, "gorditmp04");
				data = data.replace(/<b[^>]*>/gi, "gorditmp05");
				data = data.replace(/<\/b[^>]*>/gi, "gorditmp06");
				data = strip_html(data);
				data = data.replace(/gorditmp01/gi, "<td>");
				data = data.replace(/gorditmp02/gi, "</td>");
				data = data.replace(/gorditmp03/gi, "<tr>");
				data = data.replace(/gorditmp04/gi, "</tr>");
				data = data.replace(/gorditmp05/gi, "<b>");
				data = data.replace(/gorditmp06/gi, "</b>");
				data = "<table>" + data + "</table>";

				// Removing some notes
				data = data.replace(/\[[^(\])]*\]/gi, "");
				//data = data.replace(/{[a-zA-Z.-]+}/ig, ""); <-- TODO Is this really necessary
				data = data.replace(/&lt;([^&]*)&gt;/gi, "");

				return data;
			} else return "none";
		},
		url: function(language, input_language) {
			if (
				(input_language == "de" && language == "en") ||
				(input_language == "en" && language == "de")
			)
				return "http://www.dict.cc/?s=";
			else if (input_language == language) {
				// Making the german-english translation the default one if input_language and language are the same
				document.getElementById("tip").innerHTML =
					"<i><p>Tip: Change the input language for the dictionary.</p></i>";
				return "http://www.dict.cc/?s=";
			} else return "http://" + language + input_language + ".dict.cc/?s=";
		},
		info: ["Dictionary (dict.cc)", "dict.cc"]
	}

	// Search function for Google Translate
	//
	// Works only in theory. The source code which is send to an
	// ordinary user by Google differs from that which this
	// extension receives by getting the code from Google.
	/*
	google_translate: {
		innerText: function (data) {
			var begin = data.search(/<span id=result_box/i);

			if (begin != -1) {
				var end = data.indexOf("</span>", data.indexOf("</span>", begin)+7);
				data = data.slice(begin, end);

				// Strip html elements
				data = strip_html(data);

				return data;
			} else return "none";
		},
		url: function (language, input_language) {
			return "https://translate.google.de/#auto/" + language + "/";
		},
		info: ["Google Translate", "G. Dict"]
	}
	*/
};
