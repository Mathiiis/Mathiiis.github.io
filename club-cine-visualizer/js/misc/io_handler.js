let IoHandler = new function() {

    const KEY_ENTER = 13;
    const KEY_ESC = 27;
    const KEY_SPACE = 32;
    const KEY_ARROW_LEFT = 37;
    const KEY_ARROW_UP = 38;
    const KEY_ARROW_RIGHT = 39;
    const KEY_ARROW_DOWN = 40;
    const KEY_F_UPPER = 70;
    const KEY_G_UPPER = 71;
    const KEY_L_UPPER = 76;
    const KEY_P_UPPER = 80;
    const KEY_S_UPPER = 83;
    const KEY_F_LOWER = 102;
    const KEY_G_LOWER = 103;
    const KEY_L_LOWER = 108; // code correct pour "l"
    const KEY_P_LOWER = 112; // code correct pour "p"
    const KEY_S_LOWER = 115; // code correct pour "s"

    let dragging = Array();
    let dragElements = Array();
    let dragCallbacks = Array();

    const isKeyL = event => {
        const key = (event.key || "").toLowerCase();
        return key === "l" || event.which === KEY_L_UPPER || event.which === KEY_L_LOWER;
    };

    const isKeyP = event => {
        const key = (event.key || "").toLowerCase();
        return key === "p" || event.which === KEY_P_UPPER || event.which === KEY_P_LOWER;
    };

    this.setUp = function() {
        $("#db-view").on("click", ".row-title", function() {
            if ($(this).find("input").length == 0) {
                GuiWrapper.toggleTextField($(this));
            }
        });

        $("#db-view").on("click", ".row-artist", function() {
            if ($(this).find("input").length == 0) {
                GuiWrapper.toggleTextField($(this));
            }
        });

        $("#db-view").on("blur", ".db-edit-input", function() {
            GuiWrapper.toggleTextField($(this).parent());
        });

        $(document).keypress(event => {
            let focused = $(document.activeElement);
            if (focused.hasClass("db-edit-input")) {
                if (event.which == KEY_ENTER) {
                    GuiWrapper.toggleTextField(focused.parent());
                }
            } else {
                switch (event.which) {
                    case KEY_F_UPPER:
                    case KEY_F_LOWER: {
                        if (!GuiWrapper.keepGui) {
                            Background.flipImage();
                        }

                        break;
                    }
                    case KEY_G_UPPER:
                    case KEY_G_LOWER: {
                        if (!GuiWrapper.keepGui) {
                            Canvas.toggleGlow();
                        }

                        break;
                    }
                    default: {
                        if (isKeyL(event)) {
                            GuiWrapper.openGui(); // Library / playlist
                            event.preventDefault();
                        } else if (isKeyP(event)) {
                            GuiWrapper.toggleOverlay(); // Player overlay (comme now-playing)
                            event.preventDefault();
                        }
                    }
                }
            }
        });

        $(document).keydown(event => {
            // Library sur L/l, player sur P/p
            if (!event.metaKey && !event.ctrlKey && !event.altKey) {
                if (isKeyL(event)) {
                    GuiWrapper.openGui();
                    event.preventDefault();
                    return;
                }
                if (isKeyP(event)) {
                    GuiWrapper.toggleOverlay();
                    event.preventDefault();
                    return;
                }
            }

            switch (event.which) {
                case KEY_ESC: {
                    if (GuiWrapper.keepGui) {
                        GuiWrapper.closeGui();
                    } else if (GuiWrapper.aboutOpen) {
                        GuiWrapper.closeAbout();
                    }

                    break;
                }
                case KEY_SPACE: {
                    if ($(document.activeElement).prop("tagName") != "INPUT") {
                        AudioWrap.togglePlaying();
                    }

                    break;
                }
                case KEY_ARROW_LEFT: {
                    Database.playPrevSong();

                    break;
                }
                case KEY_ARROW_RIGHT: {
                    Database.playNextSong();

                    break;
                }
                case KEY_S_UPPER:
                case KEY_S_LOWER: {
                    Database.toggleShuffle();

                    break;
                }
                case KEY_ARROW_UP: {
                    AudioWrap.setVolume(AudioWrap.getVolume() + 0.05);

                    break;
                }
                case KEY_ARROW_DOWN: {
                    AudioWrap.setVolume(AudioWrap.getVolume() - 0.05);

                    break;
                }
                default: {
                    break; // just ignore
                }
            }
        });

        $("#field-artist").on("input", function() {
            $("#gui-artist").html($(this).val());
        });

        $("#field-title").on("input", function() {
            $("#gui-title").html($(this).val());
        });

        $("body").mousemove(function (e) {
            Object.keys(dragging).forEach(k => {
                if (dragging[k]) {
                    let element = dragElements[k];
                    let callback = dragCallbacks[k];
                    callback((e.clientX - element.position().left - parseInt(element.css("margin-left"))) / element.innerWidth());
                }
            });
        });

        $("body").mouseup(e => {
            Object.keys(dragging).forEach(k => {
                if (dragging[k]) {
                    dragging[k] = false;
                }
            });
        });

        $("body").mouseenter(e => {
            if ((e.buttons & 0x1) == 0) {
                Object.keys(dragging).forEach(k => {
                    dragging[k] = false;
                });
            }
        });

        window.addEventListener("dragover", function(e) {
            e.preventDefault();
        });

        window.addEventListener("drop", function(e) {
            e.preventDefault();
            if (!e.dataTransfer || !e.dataTransfer.files.length) {
                return;
            }
            let files = Array.from(e.dataTransfer.files);
            files.forEach(file => {
                if (file.type.startsWith("image/")) {
                    Background.loadImageFile(file);
                } else if (file.type.startsWith("video/")) {
                    Background.loadVideoFile(file);
                    Background.playVideo();
                } else if (file.type.startsWith("audio/")) {
                    Database.loadAudioFile(file, true);
                }
            });
        });
    }

    this.addDragListener = function(element, callback) {
        element.mousedown(function(e) {
            dragging[element.id] = true;
            dragElements[element.id] = element;
            dragCallbacks[element.id] = callback;
        });

        element.click(function(e) {
            callback(e.offsetX / $(this).width());
        });
    }

}
