define([ "libs/underscore", "viz/visualization", "viz/bbi-data-manager", "viz/viz_views", "viz/trackster/util", "viz/trackster/slotting", "viz/trackster/painters", "viz/trackster/filters", "mvc/data", "mvc/tools", "utils/config" ], function(a, b, c, d, e, f, g, h, i, j, k) {
    var l = a.extend, m = {}, n = function(a, b) {
        m[a.attr("id")] = b;
    }, o = function(a, b, c, d) {
        c = ".group", m[a.attr("id")] = d, a.bind("drag", {
            handle: "." + b,
            relative: !0
        }, function(a, b) {
            var d, e, f, g, h, i = ($(this), $(this).parent()), j = i.children(".track,.group"), k = m[$(this).attr("id")];
            if (e = $(this).parents(c), 0 !== e.length) {
                f = e.position().top, g = f + e.outerHeight();
                var l = m[e.attr("id")];
                if (b.offsetY < f) return $(this).insertBefore(e), l.remove_drawable(k), void l.container.add_drawable_before(k, l);
                if (b.offsetY > g) return $(this).insertAfter(e), l.remove_drawable(k), void l.container.add_drawable(k);
            }
            for (e = null, h = 0; h < j.length; h++) if (d = $(j.get(h)), f = d.position().top, 
            g = f + d.outerHeight(), d.is(c) && this !== d.get(0) && b.offsetY >= f && b.offsetY <= g) return b.offsetY - f < g - b.offsetY ? d.find(".content-div").prepend(this) : d.find(".content-div").append(this), 
            k.container && k.container.remove_drawable(k), void m[d.attr("id")].add_drawable(k);
            for (h = 0; h < j.length && (d = $(j.get(h)), !(b.offsetY < d.position().top) || d.hasClass("reference-track") || d.hasClass("intro")); h++) ;
            h === j.length ? this !== j.get(h - 1) && (i.append(this), m[i.attr("id")].move_drawable(k, h)) : this !== j.get(h) && ($(this).insertBefore(j.get(h)), 
            m[i.attr("id")].move_drawable(k, b.deltaY > 0 ? h - 1 : h));
        }).bind("dragstart", function() {
            $(this).addClass("dragging");
        }).bind("dragend", function() {
            $(this).removeClass("dragging");
        });
    }, p = 20, q = 100, r = 12e3, s = 400, t = 5e3, u = 100, v = "Cannot display dataset due to an error. ", w = "A converter for this dataset is not installed. Please check your datatypes_conf.xml file.", x = "No data for this chrom/contig.", y = "Preparing data. This can take a while for a large dataset. If the visualization is saved and closed, preparation will continue in the background.", z = "Tool cannot be rerun: ", A = "Ready for display", B = 10, C = [ "Histogram", "Line", "Filled", "Intensity" ], D = function(a, b, c) {
        if (D.id_counter || (D.id_counter = 0), this.id = D.id_counter++, this.view = a, 
        this.container = b, this.drag_handle_class = c.drag_handle_class, this.is_overview = !1, 
        this.action_icons = {}, this.config = k.ConfigSettingCollection.from_models_and_saved_values(this.config_params, c.prefs), 
        this.config.get_value("name") || this.config.set_value("name", c.name), this.config_onchange && this.config.on("change", this.config_onchange, this), 
        this.container_div = this.build_container_div(), this.header_div = null, c.header !== !1) {
            var e = new d.TrackHeaderView({
                model: this,
                id: this.id
            });
            this.header_div = e.$el, this.container_div.append(this.header_div);
            var f = e.icons_div;
            this.action_icons = e.action_icons, this.container_div.hover(function() {
                f.show();
            }, function() {
                f.hide();
            });
        }
    };
    D.prototype.action_icons_def = [ {
        name: "toggle_icon",
        title: "Hide/show content",
        css_class: "toggle",
        on_click_fn: function(a) {
            a.config.get_value("content_visible") ? (a.action_icons.toggle_icon.addClass("toggle-expand").removeClass("toggle"), 
            a.hide_contents(), a.config.set_value("content_visible", !1)) : (a.action_icons.toggle_icon.addClass("toggle").removeClass("toggle-expand"), 
            a.config.set_value("content_visible", !0), a.show_contents());
        }
    }, {
        name: "settings_icon",
        title: "Edit settings",
        css_class: "gear",
        on_click_fn: function(a) {
            var b = new k.ConfigSettingCollectionView({
                collection: a.config
            });
            b.render_in_modal("Configure Track");
        }
    }, {
        name: "remove_icon",
        title: "Remove",
        css_class: "remove-icon",
        on_click_fn: function(a) {
            $(".tooltip").remove(), a.remove();
        }
    } ], l(D.prototype, {
        config_params: [ {
            key: "name",
            label: "Name",
            type: "text",
            default_value: ""
        }, {
            key: "content_visible",
            type: "bool",
            default_value: !0,
            hidden: !0
        } ],
        config_onchange: function() {},
        init: function() {},
        changed: function() {
            this.view.changed();
        },
        can_draw: function() {
            return this.enabled && this.config.get_value("content_visible") ? !0 : !1;
        },
        request_draw: function() {},
        _draw: function() {},
        to_dict: function() {},
        set_name: function(a) {
            this.old_name = this.config.get_value("name"), this.config.set_value("name", a);
        },
        revert_name: function() {
            this.old_name && this.config.set_value("name", this.old_name);
        },
        remove: function() {
            this.changed(), this.container.remove_drawable(this);
            var a = this.view;
            this.container_div.hide(0, function() {
                $(this).remove(), a.update_intro_div();
            });
        },
        build_container_div: function() {},
        update_icons: function() {},
        hide_contents: function() {},
        show_contents: function() {},
        get_drawables: function() {}
    });
    var E = function(a, b, c) {
        D.call(this, a, b, c), this.obj_type = c.obj_type, this.drawables = [];
    };
    l(E.prototype, D.prototype, {
        unpack_drawables: function(a) {
            this.drawables = [];
            for (var b, c = 0; c < a.length; c++) b = Z(a[c], this.view, this), this.add_drawable(b);
        },
        init: function() {
            for (var a = 0; a < this.drawables.length; a++) this.drawables[a].init();
        },
        _draw: function(a) {
            for (var b = 0; b < this.drawables.length; b++) this.drawables[b]._draw(a);
        },
        to_dict: function() {
            for (var a = [], b = 0; b < this.drawables.length; b++) a.push(this.drawables[b].to_dict());
            return {
                prefs: this.config.to_key_value_dict(),
                obj_type: this.obj_type,
                drawables: a
            };
        },
        add_drawable: function(a) {
            this.drawables.push(a), a.container = this, this.changed();
        },
        add_drawable_before: function(a, b) {
            this.changed();
            var c = this.drawables.indexOf(b);
            return -1 !== c ? (this.drawables.splice(c, 0, a), !0) : !1;
        },
        replace_drawable: function(a, b, c) {
            var d = this.drawables.indexOf(a);
            return -1 !== d && (this.drawables[d] = b, c && a.container_div.replaceWith(b.container_div), 
            this.changed()), d;
        },
        remove_drawable: function(a) {
            var b = this.drawables.indexOf(a);
            return -1 !== b ? (this.drawables.splice(b, 1), a.container = null, this.changed(), 
            !0) : !1;
        },
        move_drawable: function(a, b) {
            var c = this.drawables.indexOf(a);
            return -1 !== c ? (this.drawables.splice(c, 1), this.drawables.splice(b, 0, a), 
            this.changed(), !0) : !1;
        },
        get_drawables: function() {
            return this.drawables;
        },
        get_tracks: function(a) {
            for (var b, c = this.drawables.slice(0), d = []; 0 !== c.length; ) b = c.shift(), 
            b instanceof a ? d.push(b) : b.drawables && (c = c.concat(b.drawables));
            return d;
        }
    });
    var F = function(a, b, c) {
        if (l(c, {
            obj_type: "DrawableGroup",
            drag_handle_class: "group-handle"
        }), E.call(this, a, b, c), this.content_div = $("<div/>").addClass("content-div").attr("id", "group_" + this.id + "_content_div").appendTo(this.container_div), 
        n(this.container_div, this), n(this.content_div, this), o(this.container_div, this.drag_handle_class, ".group", this), 
        this.filters_manager = new h.FiltersManager(this), this.header_div.after(this.filters_manager.parent_div), 
        this.filters_manager.parent_div.after($("<div style='clear: both'/>")), this.saved_filters_managers = [], 
        "drawables" in c && this.unpack_drawables(c.drawables), "filters" in c) {
            var d = this.filters_manager;
            this.filters_manager = new h.FiltersManager(this, c.filters), d.parent_div.replaceWith(this.filters_manager.parent_div), 
            c.filters.visible && this.setup_multitrack_filtering();
        }
    };
    l(F.prototype, D.prototype, E.prototype, {
        action_icons_def: [ D.prototype.action_icons_def[0], D.prototype.action_icons_def[1], {
            name: "composite_icon",
            title: "Show composite track",
            css_class: "layers-stack",
            on_click_fn: function(a) {
                $(".tooltip").remove(), a.show_composite_track();
            }
        }, {
            name: "filters_icon",
            title: "Filters",
            css_class: "ui-slider-050",
            on_click_fn: function(a) {
                a.filters_manager.visible() ? (a.filters_manager.clear_filters(), a._restore_filter_managers()) : (a.setup_multitrack_filtering(), 
                a.request_draw({
                    clear_tile_cache: !0
                })), a.filters_manager.toggle();
            }
        }, D.prototype.action_icons_def[2] ],
        build_container_div: function() {
            var a = $("<div/>").addClass("group").attr("id", "group_" + this.id);
            return this.container && this.container.content_div.append(a), a;
        },
        hide_contents: function() {
            this.tiles_div.hide();
        },
        show_contents: function() {
            this.tiles_div.show(), this.request_draw();
        },
        update_icons: function() {
            var a = this.drawables.length;
            if (0 === a) this.action_icons.composite_icon.hide(), this.action_icons.filters_icon.hide(); else if (1 === a) this.action_icons.composite_icon.toggle(this.drawables[0] instanceof R), 
            this.action_icons.filters_icon.hide(); else {
                var b, c, d, e = !0, f = this.drawables[0].get_type(), g = 0;
                for (b = 0; a > b; b++) {
                    if (d = this.drawables[b], d.get_type() !== f) {
                        can_composite = !1;
                        break;
                    }
                    d instanceof V && g++;
                }
                if (e && this.drawables[0] instanceof T ? this.action_icons.composite_icon.show() : (this.action_icons.composite_icon.hide(), 
                $(".tooltip").remove()), g > 1 && g === this.drawables.length) {
                    var i, j = {};
                    for (d = this.drawables[0], c = 0; c < d.filters_manager.filters.length; c++) i = d.filters_manager.filters[c], 
                    j[i.name] = [ i ];
                    for (b = 1; b < this.drawables.length; b++) for (d = this.drawables[b], c = 0; c < d.filters_manager.filters.length; c++) i = d.filters_manager.filters[c], 
                    i.name in j && j[i.name].push(i);
                    this.filters_manager.remove_all();
                    var k, l;
                    for (var m in j) k = j[m], k.length === g && (l = new h.NumberFilter({
                        name: k[0].name,
                        index: k[0].index
                    }), this.filters_manager.add_filter(l));
                    this.action_icons.filters_icon.toggle(this.filters_manager.filters.length > 0);
                } else this.action_icons.filters_icon.hide();
            }
        },
        _restore_filter_managers: function() {
            for (var a = 0; a < this.drawables.length; a++) this.drawables[a].filters_manager = this.saved_filters_managers[a];
            this.saved_filters_managers = [];
        },
        setup_multitrack_filtering: function() {
            if (this.filters_manager.filters.length > 0) {
                this.saved_filters_managers = [];
                for (var a = 0; a < this.drawables.length; a++) drawable = this.drawables[a], this.saved_filters_managers.push(drawable.filters_manager), 
                drawable.filters_manager = this.filters_manager;
            }
            this.filters_manager.init_filters();
        },
        show_composite_track: function() {
            {
                var a = new R(this.view, this.view, {
                    name: this.config.get_value("name"),
                    drawables: this.drawables
                });
                this.container.replace_drawable(this, a, !0);
            }
            a.request_draw();
        },
        add_drawable: function(a) {
            E.prototype.add_drawable.call(this, a), this.update_icons();
        },
        remove_drawable: function(a) {
            E.prototype.remove_drawable.call(this, a), this.update_icons();
        },
        to_dict: function() {
            this.filters_manager.visible() && this._restore_filter_managers();
            var a = l(E.prototype.to_dict.call(this), {
                filters: this.filters_manager.to_dict()
            });
            return this.filters_manager.visible() && this.setup_multitrack_filtering(), a;
        },
        request_draw: function(b) {
            a.each(this.drawables, function(a) {
                a.request_draw(b);
            });
        }
    });
    var G = Backbone.View.extend({
        initialize: function(a) {
            l(a, {
                obj_type: "View"
            }), E.call(this, "View", a.container, a), this.chrom = null, this.vis_id = a.vis_id, 
            this.dbkey = a.dbkey, this.stand_alone = void 0 !== a.stand_alone ? a.stand_alone : !0, 
            this.label_tracks = [], this.tracks_to_be_redrawn = [], this.max_low = 0, this.max_high = 0, 
            this.zoom_factor = 3, this.min_separation = 30, this.has_changes = !1, this.load_chroms_deferred = null, 
            this.render(), this.canvas_manager = new b.CanvasManager(this.container.get(0).ownerDocument), 
            this.reset(), this.config = k.ConfigSettingCollection.from_models_and_saved_values([ {
                key: "name",
                label: "Name",
                type: "text",
                default_value: ""
            }, {
                key: "a_color",
                label: "A Color",
                type: "color",
                default_value: "#FF0000"
            }, {
                key: "c_color",
                label: "C Color",
                type: "color",
                default_value: "#00FF00"
            }, {
                key: "g_color",
                label: "G Color",
                type: "color",
                default_value: "#0000FF"
            }, {
                key: "t_color",
                label: "T Color",
                type: "color",
                default_value: "#FF00FF"
            }, {
                key: "n_color",
                label: "N Color",
                type: "color",
                default_value: "#AAAAAA"
            } ], {
                name: a.name
            });
        },
        render: function() {
            this.requested_redraw = !1;
            var c = this.container, d = this;
            this.top_container = $("<div/>").addClass("top-container").appendTo(c), this.browser_content_div = $("<div/>").addClass("content").appendTo(c), 
            this.bottom_container = $("<div/>").addClass("bottom-container").appendTo(c), this.top_labeltrack = $("<div/>").addClass("top-labeltrack").appendTo(this.top_container), 
            this.viewport_container = $("<div/>").addClass("viewport-container").attr("id", "viewport-container").appendTo(this.browser_content_div), 
            this.content_div = this.viewport_container, n(this.viewport_container, d), this.intro_div = $("<div/>").addClass("intro").appendTo(this.viewport_container);
            $("<div/>").text("Add Datasets to Visualization").addClass("action-button").appendTo(this.intro_div).click(function() {
                b.select_datasets(galaxy_config.root + "visualization/list_current_history_datasets", galaxy_config.root + "api/datasets", {
                    "f-dbkey": d.dbkey
                }, function(b) {
                    a.each(b, function(a) {
                        d.add_drawable(Z(a, d, d));
                    });
                });
            });
            this.nav_container = $("<div/>").addClass("trackster-nav-container").prependTo(this.top_container), 
            this.nav = $("<div/>").addClass("trackster-nav").appendTo(this.nav_container), this.stand_alone && (this.nav_container.addClass("stand-alone"), 
            this.nav.addClass("stand-alone")), this.overview = $("<div/>").addClass("overview").appendTo(this.bottom_container), 
            this.overview_viewport = $("<div/>").addClass("overview-viewport").appendTo(this.overview), 
            this.overview_close = $("<a/>").attr("title", "Close overview").addClass("icon-button overview-close tooltip").hide().appendTo(this.overview_viewport), 
            this.overview_highlight = $("<div/>").addClass("overview-highlight").hide().appendTo(this.overview_viewport), 
            this.overview_box_background = $("<div/>").addClass("overview-boxback").appendTo(this.overview_viewport), 
            this.overview_box = $("<div/>").addClass("overview-box").appendTo(this.overview_viewport), 
            this.default_overview_height = this.overview_box.height(), this.nav_controls = $("<div/>").addClass("nav-controls").appendTo(this.nav), 
            this.chrom_select = $("<select/>").attr({
                name: "chrom"
            }).addClass("chrom-nav").append("<option value=''>Loading</option>").appendTo(this.nav_controls);
            var e = function(a) {
                ("focusout" === a.type || 13 === (a.keyCode || a.which) || 27 === (a.keyCode || a.which)) && (27 !== (a.keyCode || a.which) && d.go_to($(this).val()), 
                $(this).hide(), $(this).val(""), d.location_span.show(), d.chrom_select.show()), 
                a.stopPropagation();
            };
            this.nav_input = $("<input/>").addClass("nav-input").hide().bind("keyup focusout", e).appendTo(this.nav_controls), 
            this.location_span = $("<span/>").addClass("location").attr("title", "Click to change location").tooltip({
                placement: "bottom"
            }).appendTo(this.nav_controls), this.location_span.click(function() {
                d.location_span.hide(), d.chrom_select.hide(), d.nav_input.val(d.chrom + ":" + d.low + "-" + d.high), 
                d.nav_input.css("display", "inline-block"), d.nav_input.select(), d.nav_input.focus(), 
                d.nav_input.autocomplete({
                    source: function(a, b) {
                        var c = [], e = $.map(d.get_tracks(V), function(b) {
                            return b.data_manager.search_features(a.term).success(function(a) {
                                c = c.concat(a);
                            });
                        });
                        $.when.apply($, e).done(function() {
                            b($.map(c, function(a) {
                                return {
                                    label: a[0],
                                    value: a[1]
                                };
                            }));
                        });
                    },
                    minLength: 2
                });
            }), void 0 !== this.vis_id && (this.hidden_input = $("<input/>").attr("type", "hidden").val(this.vis_id).appendTo(this.nav_controls)), 
            this.zo_link = $("<a/>").attr("id", "zoom-out").attr("title", "Zoom out").tooltip({
                placement: "bottom"
            }).click(function() {
                d.zoom_out();
            }).appendTo(this.nav_controls), this.zi_link = $("<a/>").attr("id", "zoom-in").attr("title", "Zoom in").tooltip({
                placement: "bottom"
            }).click(function() {
                d.zoom_in();
            }).appendTo(this.nav_controls), this.load_chroms_deferred = this.load_chroms({
                low: 0
            }), this.chrom_select.bind("change", function() {
                d.change_chrom(d.chrom_select.val());
            }), this.browser_content_div.click(function() {
                $(this).find("input").trigger("blur");
            }), this.browser_content_div.bind("dblclick", function(a) {
                d.zoom_in(a.pageX, this.viewport_container);
            }), this.overview_box.bind("dragstart", function(a, b) {
                this.current_x = b.offsetX;
            }).bind("drag", function(a, b) {
                var c = b.offsetX - this.current_x;
                this.current_x = b.offsetX;
                var e = Math.round(c / d.viewport_container.width() * (d.max_high - d.max_low));
                d.move_delta(-e);
            }), this.overview_close.click(function() {
                d.reset_overview();
            }), this.viewport_container.bind("draginit", function(a) {
                return a.clientX > d.viewport_container.width() - 16 ? !1 : void 0;
            }).bind("dragstart", function(a, b) {
                b.original_low = d.low, b.current_height = a.clientY, b.current_x = b.offsetX;
            }).bind("drag", function(a, b) {
                var c = $(this), e = b.offsetX - b.current_x, f = c.scrollTop() - (a.clientY - b.current_height);
                c.scrollTop(f), b.current_height = a.clientY, b.current_x = b.offsetX;
                var g = Math.round(e / d.viewport_container.width() * (d.high - d.low));
                d.move_delta(g);
            }), this.top_labeltrack.bind("dragstart", function() {
                return $("<div/>").addClass("zoom-area").css("height", d.browser_content_div.height() + d.top_labeltrack.height() + 1).appendTo($(this));
            }).bind("drag", function(a, b) {
                $(b.proxy).css({
                    left: Math.min(a.pageX, b.startX) - d.container.offset().left,
                    width: Math.abs(a.pageX - b.startX)
                });
                var c = Math.min(a.pageX, b.startX) - d.container.offset().left, e = Math.max(a.pageX, b.startX) - d.container.offset().left, f = d.high - d.low, g = d.viewport_container.width();
                d.update_location(Math.round(c / g * f) + d.low, Math.round(e / g * f) + d.low);
            }).bind("dragend", function(a, b) {
                var c = Math.min(a.pageX, b.startX), e = Math.max(a.pageX, b.startX), f = d.high - d.low, g = d.viewport_container.width(), h = d.low;
                d.low = Math.round(c / g * f) + h, d.high = Math.round(e / g * f) + h, $(b.proxy).remove(), 
                d.request_redraw();
            }), this.add_label_track(new Q(this, {
                content_div: this.top_labeltrack
            })), $(window).bind("resize", function() {
                this.resize_timer && clearTimeout(this.resize_timer), this.resize_timer = setTimeout(function() {
                    d.resize_window();
                }, 500);
            }), $(document).bind("redraw", function() {
                d.redraw();
            }), this.reset(), $(window).trigger("resize");
        },
        get_base_color: function(a) {
            return this.config.get_value(a.toLowerCase() + "_color") || this.config.get_value("n_color");
        }
    });
    l(G.prototype, E.prototype, {
        changed: function() {
            this.has_changes = !0;
        },
        update_intro_div: function() {
            this.intro_div.toggle(0 === this.drawables.length);
        },
        trigger_navigate: function(a, b, c, d) {
            if (this.timer && clearTimeout(this.timer), d) {
                var e = this;
                this.timer = setTimeout(function() {
                    e.trigger("navigate", a + ":" + b + "-" + c);
                }, 500);
            } else view.trigger("navigate", a + ":" + b + "-" + c);
        },
        update_location: function(a, b) {
            this.location_span.text(commatize(a) + " - " + commatize(b)), this.nav_input.val(this.chrom + ":" + commatize(a) + "-" + commatize(b));
            var c = this.chrom_select.val();
            "" !== c && this.trigger_navigate(c, this.low, this.high, !0);
        },
        load_chroms: function(a) {
            a.num = u;
            var b = this, c = $.Deferred();
            return $.ajax({
                url: galaxy_config.root + "api/genomes/" + this.dbkey,
                data: a,
                dataType: "json",
                success: function(a) {
                    if (0 !== a.chrom_info.length) {
                        if (a.reference) {
                            var d = new S(b);
                            b.add_label_track(d), b.reference_track = d;
                        }
                        b.chrom_data = a.chrom_info;
                        for (var e = '<option value="">Select Chrom/Contig</option>', f = 0, g = b.chrom_data.length; g > f; f++) {
                            var h = b.chrom_data[f].chrom;
                            e += '<option value="' + h + '">' + h + "</option>";
                        }
                        a.prev_chroms && (e += '<option value="previous">Previous ' + u + "</option>"), 
                        a.next_chroms && (e += '<option value="next">Next ' + u + "</option>"), b.chrom_select.html(e), 
                        b.chrom_start_index = a.start_index, c.resolve(a.chrom_info);
                    }
                },
                error: function() {
                    alert("Could not load chroms for this dbkey: " + b.dbkey);
                }
            }), c;
        },
        change_chrom: function(a, b, c) {
            var d = this;
            if (!d.chrom_data) return void d.load_chroms_deferred.then(function() {
                d.change_chrom(a, b, c);
            });
            if (a && "None" !== a) {
                if ("previous" === a) return void d.load_chroms({
                    low: this.chrom_start_index - u
                });
                if ("next" === a) return void d.load_chroms({
                    low: this.chrom_start_index + u
                });
                var e = $.grep(d.chrom_data, function(b) {
                    return b.chrom === a;
                })[0];
                if (void 0 === e) return void d.load_chroms({
                    chrom: a
                }, function() {
                    d.change_chrom(a, b, c);
                });
                if (a !== d.chrom) {
                    d.chrom = a, d.chrom_select.val(d.chrom), d.max_high = e.len - 1, d.reset();
                    for (var f = 0, g = d.drawables.length; g > f; f++) {
                        var h = d.drawables[f];
                        h.init && h.init();
                    }
                    d.reference_track && d.reference_track.init();
                }
                void 0 === b && void 0 === c ? (d.low = 0, d.high = d.max_high) : (d.low = void 0 !== b ? Math.max(b, 0) : 0, 
                void 0 === c ? (d.low = Math.max(d.low - 15, 0), d.high = d.low + 30) : d.high = Math.min(c, d.max_high)), 
                d.request_redraw();
            }
        },
        go_to: function(a) {
            a = a.replace(/,/g, ""), a = a.replace(/:|\-/g, " ");
            var b = a.split(/\s+/), c = b[0], d = b[1] ? parseInt(b[1], 10) : void 0, e = b[2] ? parseInt(b[2], 10) : void 0;
            this.change_chrom(c, d, e);
        },
        move_fraction: function(a) {
            var b = this, c = b.high - b.low;
            this.move_delta(a * c);
        },
        move_delta: function(a) {
            var b = this, c = b.high - b.low;
            b.low - a < b.max_low ? (b.low = b.max_low, b.high = b.max_low + c) : b.high - a > b.max_high ? (b.high = b.max_high, 
            b.low = b.max_high - c) : (b.high -= a, b.low -= a), b.request_redraw({
                data_fetch: !1
            }), this.redraw_on_move_fn && clearTimeout(this.redraw_on_move_fn), this.redraw_on_move_fn = setTimeout(function() {
                b.request_redraw();
            }, 200);
            var d = b.chrom_select.val();
            this.trigger_navigate(d, b.low, b.high, !0);
        },
        add_drawable: function(a) {
            E.prototype.add_drawable.call(this, a), a.init(), this.changed(), this.update_intro_div();
            var b = this;
            a.config.on("change", function() {
                b.changed();
            });
        },
        add_label_track: function(a) {
            a.view = this, a.init(), this.label_tracks.push(a);
        },
        remove_drawable: function(a, b) {
            if (E.prototype.remove_drawable.call(this, a), b) {
                var c = this;
                a.container_div.hide(0, function() {
                    $(this).remove(), c.update_intro_div();
                });
            }
        },
        reset: function() {
            this.low = this.max_low, this.high = this.max_high, this.viewport_container.find(".yaxislabel").remove();
        },
        request_redraw: function(b, c) {
            var d = this, e = c ? [ c ] : d.drawables;
            a.each(e, function(c) {
                var e = a.find(d.tracks_to_be_redrawn, function(a) {
                    return a[0] === c;
                });
                e ? e[1] = b : d.tracks_to_be_redrawn.push([ c, b ]);
            }), this.requested_redraw || (requestAnimationFrame(function() {
                d._redraw();
            }), this.requested_redraw = !0);
        },
        _redraw: function() {
            this.requested_redraw = !1;
            var b = this.low, c = this.high;
            b < this.max_low && (b = this.max_low), c > this.max_high && (c = this.max_high);
            var d = this.high - this.low;
            0 !== this.high && d < this.min_separation && (c = b + this.min_separation), this.low = Math.floor(b), 
            this.high = Math.ceil(c), this.update_location(this.low, this.high), this.resolution_px_b = this.viewport_container.width() / (this.high - this.low);
            var e = this.low / (this.max_high - this.max_low) * this.overview_viewport.width() || 0, f = (this.high - this.low) / (this.max_high - this.max_low) * this.overview_viewport.width() || 0, g = 13;
            this.overview_box.css({
                left: e,
                width: Math.max(g, f)
            }).show(), g > f && this.overview_box.css("left", e - (g - f) / 2), this.overview_highlight && this.overview_highlight.css({
                left: e,
                width: f
            }), a.each(this.tracks_to_be_redrawn, function(a) {
                var b = a[0], c = a[1];
                b && b._draw(c);
            }), this.tracks_to_be_redrawn = [], a.each(this.label_tracks, function(a) {
                a._draw();
            });
        },
        zoom_in: function(a) {
            if (!(0 === this.max_high || this.high - this.low <= this.min_separation)) {
                var b = this.high - this.low, c = b / 2 + this.low, d = b / this.zoom_factor / 2;
                a && (c = a / this.viewport_container.width() * (this.high - this.low) + this.low), 
                this.low = Math.round(c - d), this.high = Math.round(c + d), this.changed(), this.request_redraw();
            }
        },
        zoom_out: function() {
            if (0 !== this.max_high) {
                var a = this.high - this.low, b = a / 2 + this.low, c = a * this.zoom_factor / 2;
                this.low = Math.round(b - c), this.high = Math.round(b + c), this.changed(), this.request_redraw();
            }
        },
        resize_viewport: function() {
            this.viewport_container.height(this.container.height() - this.top_container.height() - this.bottom_container.height());
        },
        resize_window: function() {
            this.resize_viewport(), this.request_redraw();
        },
        set_overview: function(a) {
            if (this.overview_drawable) {
                if (this.overview_drawable.dataset.id === a.dataset.id) return;
                this.overview_viewport.find(".track").remove();
            }
            var b = a.copy({
                content_div: this.overview_viewport
            }), c = this;
            b.header_div.hide(), b.is_overview = !0, c.overview_drawable = b, this.overview_drawable.postdraw_actions = function() {
                c.overview_highlight.show().height(c.overview_drawable.content_div.height()), c.overview_viewport.height(c.overview_drawable.content_div.height() + c.overview_box.outerHeight()), 
                c.overview_close.show(), c.resize_window();
            }, c.overview_drawable.request_draw(), this.changed();
        },
        reset_overview: function() {
            $(".tooltip").remove(), this.overview_viewport.find(".track-tile").remove(), this.overview_viewport.height(this.default_overview_height), 
            this.overview_box.height(this.default_overview_height), this.overview_close.hide(), 
            this.overview_highlight.hide(), view.resize_window(), view.overview_drawable = null;
        }
    });
    var H = j.Tool.extend({
        defaults: {
            track: null
        },
        initialize: function(a) {
            j.Tool.prototype.initialize.call(this, a);
            var b = !0;
            void 0 !== a.tool_state && void 0 !== a.tool_state.hidden && (b = a.tool_state.hidden), 
            this.set("hidden", b), this.remove_inputs([ "data", "hidden_data", "conditional" ]);
        },
        state_dict: function() {
            return a.extend(this.get_inputs_dict(), {
                hidden: !this.is_visible()
            });
        }
    }), I = Backbone.View.extend({
        events: {
            "change :input": "update_value"
        },
        render: function() {
            var a = this.$el.addClass("param-row"), b = this.model, c = ($("<div>").addClass("param-label").text(b.get("label")).appendTo(a), 
            $("<div/>").addClass("param-input").html(b.get("html")).appendTo(a));
            c.find(":input").val(b.get("value")), $("<div style='clear: both;'/>").appendTo(a);
        },
        update_value: function(a) {
            this.model.set_value($(a.target).val());
        }
    }), J = Backbone.View.extend({
        initialize: function() {
            this.model.on("change:hidden", this.set_visible, this);
        },
        render: function() {
            var a = this;
            tool = this.model, parent_div = this.$el.addClass("dynamic-tool").hide(), parent_div.bind("drag", function(a) {
                a.stopPropagation();
            }).click(function(a) {
                a.stopPropagation();
            }).bind("dblclick", function(a) {
                a.stopPropagation();
            }).keydown(function(a) {
                a.stopPropagation();
            });
            $("<div class='tool-name'>").appendTo(parent_div).text(tool.get("name"));
            tool.get("inputs").each(function(a) {
                var b = new I({
                    model: a
                });
                b.render(), parent_div.append(b.$el);
            }), parent_div.find("input").click(function() {
                $(this).select();
            });
            var b = $("<div>").addClass("param-row").appendTo(parent_div), c = $("<input type='submit'>").attr("value", "Run on complete dataset").appendTo(b), d = $("<input type='submit'>").attr("value", "Run on visible region").appendTo(b);
            d.click(function() {
                a.run_on_region();
            }), c.click(function() {
                a.run_on_dataset();
            }), tool.is_visible() && this.$el.show();
        },
        set_visible: function() {
            this.$el.toggle(this.model.is_visible());
        },
        update_params: function() {
            for (var a = 0; a < this.params.length; a++) this.params[a].update_value();
        },
        run_on_dataset: function() {
            var a = this.model;
            this.run({
                target_dataset_id: this.model.get("track").dataset.id,
                action: "rerun",
                tool_id: a.id
            }, null, function() {
                Galaxy.modal.show({
                    title: a.get("name") + " is Running",
                    body: a.get("name") + " is running on the complete dataset. Tool outputs are in dataset's history.",
                    buttons: {
                        Close: function() {
                            Galaxy.modal.hide();
                        }
                    }
                });
            });
        },
        run_on_region: function() {
            var a, c = this.model.get("track"), d = this.model, e = new b.GenomeRegion({
                chrom: c.view.chrom,
                start: c.view.low,
                end: c.view.high
            }), f = {
                target_dataset_id: c.dataset.id,
                action: "rerun",
                tool_id: d.id,
                regions: [ e.toJSON() ]
            }, g = c, h = d.get("name") + g.tool_region_and_parameters_str(e);
            if (g.container === view) {
                var j = new F(view, view, {
                    name: c.config.get_value("name")
                }), k = g.container.replace_drawable(g, j, !1);
                j.container_div.insertBefore(g.view.content_div.children()[k]), j.add_drawable(g), 
                g.container_div.appendTo(j.content_div), a = j;
            } else a = g.container;
            var l = new g.constructor(view, a, {
                name: h,
                hda_ldda: "hda"
            });
            l.init_for_tool_data(), l.change_mode(g.mode), l.set_filters_manager(g.filters_manager.copy(l)), 
            l.update_icons(), a.add_drawable(l), l.tiles_div.text("Starting job."), this.run(f, l, function(a) {
                l.set_dataset(new i.Dataset(a)), l.tiles_div.text("Running job."), l.init();
            });
        },
        run: function(a, b, c) {
            a.inputs = this.model.get_inputs_dict();
            var d = new e.ServerStateDeferred({
                ajax_settings: {
                    url: galaxy_config.root + "api/tools",
                    data: JSON.stringify(a),
                    dataType: "json",
                    contentType: "application/json",
                    type: "POST"
                },
                interval: 2e3,
                success_fn: function(a) {
                    return "pending" !== a;
                }
            });
            $.when(d.go()).then(function(a) {
                "no converter" === a ? (b.container_div.addClass("error"), b.content_div.text(w)) : a.error ? (b.container_div.addClass("error"), 
                b.content_div.text(z + a.message)) : c(a);
            });
        }
    }), K = function(a, b) {
        g.Scaler.call(this, b), this.filter = a;
    };
    K.prototype.gen_val = function(a) {
        return this.filter.high === Number.MAX_VALUE || this.filter.low === -Number.MAX_VALUE || this.filter.low === this.filter.high ? this.default_val : (parseFloat(a[this.filter.index]) - this.filter.low) / (this.filter.high - this.filter.low);
    };
    var L = function(a, b, c, d, e) {
        this.track = a, this.region = b, this.low = b.get("start"), this.high = b.get("end"), 
        this.w_scale = c, this.canvas = d, this.html_elt = $("<div class='track-tile'/>").append(d), 
        this.data = e, this.stale = !1;
    };
    L.prototype.predisplay_actions = function() {};
    var M = function(a, b, c, d, e) {
        L.call(this, a, b, c, d, e);
    };
    M.prototype.predisplay_actions = function() {};
    var N = function(a, b, c, d, e, f, g, h, i, j, k) {
        L.call(this, a, b, c, d, e), this.mode = f, this.all_slotted = h, this.feature_mapper = i, 
        this.has_icons = !1, this.incomplete_features = j, this.other_tiles_features_drawn = {}, 
        this.seq_data = k;
    };
    l(N.prototype, L.prototype), N.prototype.predisplay_actions = function() {};
    var O = function(a, c, d) {
        l(d, {
            drag_handle_class: "draghandle"
        }), D.call(this, a, c, d), this.dataset = null, d.dataset && (this.dataset = d.dataset instanceof Backbone.Model ? d.dataset : new i.Dataset(d.dataset)), 
        this.dataset_check_type = "converted_datasets_state", this.data_url_extra_params = {}, 
        this.data_query_wait = "data_query_wait" in d ? d.data_query_wait : t, this.data_manager = "data_manager" in d ? d.data_manager : new b.GenomeDataManager({
            dataset: this.dataset,
            genome: new b.Genome({
                key: a.dbkey,
                chroms_info: {
                    chrom_info: a.chrom_data
                }
            }),
            data_mode_compatible: this.data_and_mode_compatible,
            can_subset: this.can_subset
        }), this.min_height_px = 16, this.max_height_px = 800, this.visible_height_px = this.config.get_value("height"), 
        this.content_div = $("<div class='track-content'>").appendTo(this.container_div), 
        this.container && (this.container.content_div.append(this.container_div), "resize" in d && !d.resize || this.add_resize_handle());
    };
    l(O.prototype, D.prototype, {
        action_icons_def: [ {
            name: "mode_icon",
            title: "Set display mode",
            css_class: "chevron-expand",
            on_click_fn: function() {}
        }, D.prototype.action_icons_def[0], {
            name: "overview_icon",
            title: "Set as overview",
            css_class: "application-dock-270",
            on_click_fn: function(a) {
                a.view.set_overview(a);
            }
        }, D.prototype.action_icons_def[1], {
            name: "filters_icon",
            title: "Filters",
            css_class: "ui-slider-050",
            on_click_fn: function(a) {
                a.filters_manager.visible() ? a.filters_manager.clear_filters() : a.filters_manager.init_filters(), 
                a.filters_manager.toggle();
            }
        }, {
            name: "tools_icon",
            title: "Tool",
            css_class: "hammer",
            on_click_fn: function(a) {
                a.tool.toggle(), a.tool.is_visible() ? a.set_name(a.config.get_value("name") + a.tool_region_and_parameters_str()) : a.revert_name(), 
                $(".tooltip").remove();
            }
        }, {
            name: "param_space_viz_icon",
            title: "Tool parameter space visualization",
            css_class: "arrow-split",
            on_click_fn: function(c) {
                var d = "<strong>Tool</strong>:" + c.tool.get("name") + "<br/><strong>Dataset</strong>:" + c.config.get_value("name") + '<br/><strong>Region(s)</strong>: <select name="regions"><option value="cur">current viewing area</option><option value="bookmarks">bookmarks</option><option value="both">current viewing area and bookmarks</option></select>', e = function() {
                    Galaxy.modal.hide(), $(window).unbind("keypress.check_enter_esc");
                }, f = function() {
                    var d, e = $('select[name="regions"] option:selected').val(), f = new b.GenomeRegion({
                        chrom: view.chrom,
                        start: view.low,
                        end: view.high
                    }), g = a.map($(".bookmark"), function(a) {
                        return new b.GenomeRegion({
                            from_str: $(a).children(".position").text()
                        });
                    });
                    d = "cur" === e ? [ f ] : "bookmarks" === e ? g : [ f ].concat(g), Galaxy.modal.hide(), 
                    window.location.href = galaxy_config.root + "visualization/sweepster?" + $.param({
                        dataset_id: c.dataset.id,
                        hda_ldda: c.dataset.get("hda_ldda"),
                        regions: JSON.stringify(new Backbone.Collection(d).toJSON())
                    });
                };
                Galaxy.modal.show({
                    title: "Visualize tool parameter space and output from different parameter settings?",
                    body: d,
                    buttons: {
                        No: e,
                        Yes: f
                    }
                });
            }
        }, D.prototype.action_icons_def[2] ],
        can_draw: function() {
            return this.dataset && D.prototype.can_draw.call(this);
        },
        build_container_div: function() {
            return $("<div/>").addClass("track").attr("id", "track_" + this.id);
        },
        set_dataset: function(a) {
            this.dataset = a, this.data_manager.set("dataset", a);
        },
        on_resize: function() {
            this.request_draw({
                clear_tile_cache: !0
            });
        },
        add_resize_handle: function() {
            var a = this, b = !1, c = !1, d = $("<div class='track-resize'>");
            $(a.container_div).hover(function() {
                a.config.get_value("content_visible") && (b = !0, d.show());
            }, function() {
                b = !1, c || d.hide();
            }), d.hide().bind("dragstart", function(b, d) {
                c = !0, d.original_height = $(a.content_div).height();
            }).bind("drag", function(b, c) {
                var d = Math.min(Math.max(c.original_height + c.deltaY, a.min_height_px), a.max_height_px);
                $(a.tiles_div).css("height", d), a.visible_height_px = a.max_height_px === d ? 0 : d, 
                a.on_resize();
            }).bind("dragend", function() {
                a.tile_cache.clear(), c = !1, b || d.hide(), a.config.set_value("height", a.visible_height_px), 
                a.changed();
            }).appendTo(a.container_div);
        },
        hide_contents: function() {
            this.tiles_div.hide(), this.container_div.find(".yaxislabel, .track-resize").hide();
        },
        show_contents: function() {
            this.tiles_div.show(), this.container_div.find(".yaxislabel, .track-resize").show(), 
            this.request_draw();
        },
        get_type: function() {
            return this instanceof Q ? "LabelTrack" : this instanceof S ? "ReferenceTrack" : this instanceof T ? "LineTrack" : this instanceof X ? "ReadTrack" : this instanceof W ? "VariantTrack" : this instanceof R ? "CompositeTrack" : this instanceof V ? "FeatureTrack" : "";
        },
        show_message: function(a) {
            return this.tiles_div.remove(), $("<span/>").addClass("message").html(a).appendTo(this.content_div);
        },
        init: function(a) {
            var b = this;
            if (b.enabled = !1, b.tile_cache.clear(), b.data_manager.clear(), b.content_div.children().remove(), 
            b.container_div.removeClass("nodata error pending"), b.tiles_div = $("<div/>").addClass("tiles").appendTo(b.content_div), 
            b.dataset.id) {
                var c = $.Deferred(), d = {
                    hda_ldda: b.dataset.get("hda_ldda"),
                    data_type: this.dataset_check_type,
                    chrom: b.view.chrom,
                    retry: a
                };
                return $.getJSON(this.dataset.url(), d, function(a) {
                    if (a && "error" !== a && "error" !== a.kind) "no converter" === a ? (b.container_div.addClass("error"), 
                    b.show_message(w)) : "no data" === a || void 0 !== a.data && (null === a.data || 0 === a.data.length) ? (b.container_div.addClass("nodata"), 
                    b.show_message(x)) : "pending" === a ? (b.container_div.addClass("pending"), b.show_message(y), 
                    setTimeout(function() {
                        b.init();
                    }, b.data_query_wait)) : ("data" === a || "data" === a.status) && (a.valid_chroms && (b.valid_chroms = a.valid_chroms, 
                    b.update_icons()), b.tiles_div.text(A), b.view.chrom ? (b.tiles_div.text(""), b.tiles_div.css("height", b.visible_height_px + "px"), 
                    b.enabled = !0, $.when.apply($, b.predraw_init()).done(function() {
                        c.resolve(), b.container_div.removeClass("nodata error pending"), b.request_draw();
                    })) : c.resolve()); else {
                        b.container_div.addClass("error");
                        var d = b.show_message(v);
                        a.message && (d.append($("<a href='javascript:void(0);'></a>").text("View error").click(function() {
                            Galaxy.modal.show({
                                title: "Trackster Error",
                                body: "<pre>" + a.message + "</pre>",
                                buttons: {
                                    Close: function() {
                                        Galaxy.modal.hide();
                                    }
                                }
                            });
                        })), d.append($("<span/>").text(" ")), d.append($("<a href='javascript:void(0);'></a>").text("Try again").click(function() {
                            b.init(!0);
                        })));
                    }
                }), this.update_icons(), c;
            }
        },
        predraw_init: function() {
            var a = this;
            return $.getJSON(a.dataset.url(), {
                data_type: "data",
                stats: !0,
                chrom: a.view.chrom,
                low: 0,
                high: a.view.max_high,
                hda_ldda: a.dataset.get("hda_ldda")
            }, function(b) {
                var c = b.data;
                if (void 0 !== c && void 0 !== c.min && void 0 !== c.max) {
                    var d = c.min, e = c.max;
                    d = Math.floor(Math.min(0, Math.max(d, c.mean - 2 * c.sd))), e = Math.ceil(Math.max(0, Math.min(e, c.mean + 2 * c.sd))), 
                    a.config.set_default_value("min_value", d), a.config.set_default_value("max_value", e), 
                    a.config.set_value("min_value", d), a.config.set_value("max_value", e);
                }
            });
        },
        get_drawables: function() {
            return this;
        }
    });
    var P = function(c, d, e) {
        O.call(this, c, d, e);
        var f = this;
        if (o(f.container_div, f.drag_handle_class, ".group", f), this.filters_manager = new h.FiltersManager(this, "filters" in e ? e.filters : null), 
        this.data_manager.set("filters_manager", this.filters_manager), this.filters_available = !1, 
        this.tool = e.tool ? new H(a.extend(e.tool, {
            track: this,
            tool_state: e.tool_state
        })) : null, this.tile_cache = new b.Cache(B), this.left_offset = 0, this.header_div && (this.set_filters_manager(this.filters_manager), 
        this.tool)) {
            var g = new J({
                model: this.tool
            });
            g.render(), this.dynamic_tool_div = g.$el, this.header_div.after(this.dynamic_tool_div);
        }
        this.tiles_div = $("<div/>").addClass("tiles").appendTo(this.content_div), this.config.get_value("content_visible") || this.tiles_div.hide(), 
        this.overlay_div = $("<div/>").addClass("overlay").appendTo(this.content_div), e.mode && this.change_mode(e.mode);
    };
    l(P.prototype, D.prototype, O.prototype, {
        action_icons_def: O.prototype.action_icons_def.concat([ {
            name: "show_more_rows_icon",
            title: "To minimize track height, not all feature rows are displayed. Click to display more rows.",
            css_class: "exclamation",
            on_click_fn: function(a) {
                $(".tooltip").remove(), a.slotters[a.view.resolution_px_b].max_rows *= 2, a.request_draw({
                    clear_tile_cache: !0
                });
            },
            hide: !0
        } ]),
        copy: function(a) {
            var b = this.to_dict();
            l(b, {
                data_manager: this.data_manager
            });
            var c = new this.constructor(this.view, a, b);
            return c.change_mode(this.mode), c.enabled = this.enabled, c;
        },
        set_filters_manager: function(a) {
            this.filters_manager = a, this.header_div.after(this.filters_manager.parent_div);
        },
        to_dict: function() {
            return {
                track_type: this.get_type(),
                dataset: {
                    id: this.dataset.id,
                    hda_ldda: this.dataset.get("hda_ldda")
                },
                prefs: this.config.to_key_value_dict(),
                mode: this.mode,
                filters: this.filters_manager.to_dict(),
                tool_state: this.tool ? this.tool.state_dict() : {}
            };
        },
        set_min_max: function() {
            var a = this;
            return $.getJSON(a.dataset.url(), {
                data_type: "data",
                stats: !0,
                chrom: a.view.chrom,
                low: 0,
                high: a.view.max_high,
                hda_ldda: a.dataset.get("hda_ldda")
            }, function(b) {
                var c = b.data;
                if (isNaN(parseFloat(a.config.get_value("min_value"))) || isNaN(parseFloat(a.config.get_value("max_value")))) {
                    var d = c.min, e = c.max;
                    d = Math.floor(Math.min(0, Math.max(d, c.mean - 2 * c.sd))), e = Math.ceil(Math.max(0, Math.min(e, c.mean + 2 * c.sd))), 
                    a.config.set_value("min_value", d), a.config.set_value("max_value", e);
                }
            });
        },
        change_mode: function(a) {
            var b = this;
            return b.mode = a, b.config.set_value("mode", a), "Auto" === a && this.data_manager.clear(), 
            b.request_draw({
                clear_tile_cache: !0
            }), this.action_icons.mode_icon.attr("title", "Set display mode (now: " + b.mode + ")"), 
            b;
        },
        update_icons: function() {
            var a = this;
            a.action_icons.filters_icon.toggle(a.filters_available), a.action_icons.tools_icon.toggle(null !== a.tool), 
            a.action_icons.param_space_viz_icon.toggle(null !== a.tool);
        },
        _gen_tile_cache_key: function(a, b) {
            return a + "_" + b;
        },
        request_draw: function(a) {
            a && a.clear_tile_cache && this.tile_cache.clear(), this.view.request_redraw(a, this);
        },
        before_draw: function() {
            this.max_height_px = 0;
        },
        _draw: function(c) {
            if (this.can_draw()) {
                var d = c && c.clear_after, e = this.view.low, f = this.view.high, g = this.view.container.width(), h = this.view.resolution_px_b, i = 1 / h;
                this.is_overview && (e = this.view.max_low, f = this.view.max_high, h = g / (view.max_high - view.max_low), 
                i = 1 / h), this.before_draw(), this.tiles_div.children().addClass("remove");
                for (var j, k, l = Math.floor(s * i), m = Math.floor(e / l), n = [], o = []; f > m * l; ) j = new b.GenomeRegion({
                    chrom: this.view.chrom,
                    start: m * l,
                    end: Math.min((m + 1) * l, this.view.max_high)
                }), k = this.draw_helper(j, h, c), n.push(k), $.when(k).then(function(a) {
                    o.push(a);
                }), m += 1;
                d || this.tiles_div.children(".remove").removeClass("remove").remove();
                var p = this;
                $.when.apply($, n).then(function() {
                    p.tiles_div.children(".remove").remove(), o = a.filter(o, function(a) {
                        return null !== a;
                    }), 0 !== o.length && p.postdraw_actions(o, g, h, d);
                });
            }
        },
        _add_yaxis_label: function(a, b) {
            var c = this, d = "max" === a ? "top" : "bottom", e = "max" === a ? "max" : "min", f = "max" === a ? "max_value" : "min_value", g = this.container_div.find(".yaxislabel." + d);
            b = b || function() {
                c.request_draw({
                    clear_tile_cache: !0
                });
            }, 0 !== g.length ? g.text(c.config.get_value(f)) : (g = $("<div/>").text(c.config.get_value(f)).make_text_editable({
                num_cols: 12,
                on_finish: function(a) {
                    $(".tooltip").remove(), c.config.set_value(f, a), b();
                },
                help_text: "Set " + e + " value"
            }).addClass("yaxislabel " + d).css("color", this.config.get_value("label_color")), 
            this.container_div.prepend(g));
        },
        postdraw_actions: function(b, c, d) {
            var e = a.filter(b, function(a) {
                return a instanceof M;
            });
            if (e.length > 0) {
                this.max_height_px = 0;
                var f = this;
                a.each(b, function(a) {
                    a instanceof M || (a.html_elt.remove(), f.draw_helper(a.region, d, {
                        force: !0,
                        mode: "Coverage"
                    }));
                }), f._add_yaxis_label("max");
            } else {
                this.container_div.find(".yaxislabel").remove();
                var g = a.find(b, function(a) {
                    return a.has_icons;
                });
                g && a.each(b, function(a) {
                    a.has_icons || a.html_elt.css("padding-top", p);
                });
            }
        },
        get_mode: function() {
            return this.mode;
        },
        update_auto_mode: function() {},
        _get_drawables: function() {
            return [ this ];
        },
        draw_helper: function(b, c, d) {
            d || (d = {});
            var f = d.force, g = d.mode || this.mode, h = 1 / c, i = this, j = this._get_drawables(), k = this._gen_tile_cache_key(c, b), l = function(a) {
                return a && "track" in a;
            }, m = f ? void 0 : i.tile_cache.get_elt(k);
            if (m) return l(m) && i.show_tile(m, c), m;
            if (d.data_fetch === !1) return null;
            var n = function() {
                var c = a.find(C, function(a) {
                    return a === g;
                }) ? "Coverage" : g, d = a.map(j, function(a) {
                    return a.data_manager.get_data(b, c, h, i.data_url_extra_params);
                });
                return view.reference_track && d.push(view.reference_track.data_manager.get_data(b, g, h, view.reference_track.data_url_extra_params)), 
                d;
            }, o = $.Deferred();
            return i.tile_cache.set_elt(k, o), $.when.apply($, n()).then(function() {
                var f, g = n(), h = g;
                if (a.find(g, function(a) {
                    return e.is_deferred(a);
                })) return i.tile_cache.set_elt(k, void 0), void $.when(i.draw_helper(b, c, d)).then(function(a) {
                    o.resolve(a);
                });
                view.reference_track && (f = view.reference_track.data_manager.subset_entry(g.pop(), b));
                var l = [], m = [];
                a.each(j, function(a, b) {
                    var d = a.mode, e = h[b];
                    "Auto" === d && (d = a.get_mode(e), a.update_auto_mode(d)), l.push(d), m.push(a.get_canvas_height(e, d, c, t));
                });
                var p, q = i.view.canvas_manager.new_canvas(), r = b.get("start"), s = b.get("end"), t = Math.ceil((s - r) * c) + i.left_offset, u = a.max(m);
                q.width = t, q.height = d.height || u;
                var v = q.getContext("2d");
                v.translate(i.left_offset, 0), j.length > 1 && (v.globalAlpha = .5, v.globalCompositeOperation = "source-over"), 
                a.each(j, function(a, d) {
                    p = a.draw_tile(h[d], v, l[d], b, c, f);
                }), void 0 !== p && (i.tile_cache.set_elt(k, p), i.show_tile(p, c)), o.resolve(p);
            }), o;
        },
        get_canvas_height: function() {
            return this.visible_height_px;
        },
        _draw_line_track_tile: function(a, b, c, d, e) {
            var f = b.canvas, h = new g.LinePainter(a.data, d.get("start"), d.get("end"), this.config.to_key_value_dict(), c);
            return h.draw(b, f.width, f.height, e), new M(this, d, e, f, a.data);
        },
        draw_tile: function() {},
        show_tile: function(a, b) {
            var c = a.html_elt;
            a.predisplay_actions();
            var d = Math.round((a.low - (this.is_overview ? this.view.max_low : this.view.low)) * b);
            this.left_offset && (d -= this.left_offset), c.css("left", d), c.hasClass("remove") ? c.removeClass("remove") : this.tiles_div.append(c), 
            c.css("height", "auto"), this.max_height_px = Math.max(this.max_height_px, c.height() - 2), 
            c.parent().children().css("height", this.max_height_px + "px");
            var e = this.max_height_px;
            0 !== this.visible_height_px && (e = Math.min(this.max_height_px, this.visible_height_px)), 
            this.tiles_div.css("height", e + "px");
        },
        tool_region_and_parameters_str: function(b) {
            var c = this, d = void 0 !== b ? b.toString() : "all", e = a.values(c.tool.get_inputs_dict()).join(", ");
            return " - region=[" + d + "], parameters=[" + e + "]";
        },
        data_and_mode_compatible: function(a, b) {
            return "Auto" === b ? !0 : "Coverage" === b ? "bigwig" === a.dataset_type : "bigwig" === a.dataset_type || "no_detail" === a.extra_info ? !1 : !0;
        },
        can_subset: function(a) {
            return a.message || "no_detail" === a.extra_info ? !1 : "bigwig" === a.dataset_type ? a.data[1][0] - a.data[0][0] === 1 : !0;
        },
        init_for_tool_data: function() {
            this.data_manager.set("data_type", "raw_data"), this.data_query_wait = 1e3, this.dataset_check_type = "state";
        }
    });
    var Q = function(a, b) {
        O.call(this, a, b, {
            resize: !1,
            header: !1
        }), this.container_div.addClass("label-track");
    };
    l(Q.prototype, O.prototype, {
        init: function() {
            this.enabled = !0;
        },
        predraw_init: function() {},
        _draw: function() {
            for (var a = this.view, b = a.high - a.low, c = Math.floor(Math.pow(10, Math.floor(Math.log(b) / Math.log(10)))), d = Math.floor(a.low / c) * c, e = this.view.container.width(), f = $("<div/>").addClass("label-container"); d < a.high; ) {
                var g = Math.floor((d - a.low) / b * e);
                f.append($("<div/>").addClass("label").text(commatize(d)).css({
                    left: g
                })), d += c;
            }
            this.content_div.children(":first").remove(), this.content_div.append(f);
        }
    });
    var R = function(b, c, d) {
        if (P.call(this, b, c, d), this.drawables = [], "drawables" in d) {
            for (var e, f = 0; f < d.drawables.length; f++) e = d.drawables[f], this.drawables[f] = Z(e, b, null), 
            e.left_offset > this.left_offset && (this.left_offset = e.left_offset);
            this.enabled = !0;
        }
        a.each(this.drawables, function(a) {
            (a instanceof V || a instanceof X) && a.change_mode("Coverage");
        }), this.update_icons(), this.obj_type = "CompositeTrack";
    };
    l(R.prototype, P.prototype, {
        display_modes: C,
        config_params: a.union(D.prototype.config_params, [ {
            key: "min_value",
            label: "Min Value",
            type: "float",
            default_value: void 0
        }, {
            key: "max_value",
            label: "Max Value",
            type: "float",
            default_value: void 0
        }, {
            key: "mode",
            type: "string",
            default_value: this.mode,
            hidden: !0
        }, {
            key: "height",
            type: "int",
            default_value: 30,
            hidden: !0
        } ]),
        action_icons_def: [ {
            name: "composite_icon",
            title: "Show individual tracks",
            css_class: "layers-stack",
            on_click_fn: function(a) {
                $(".tooltip").remove(), a.show_group();
            }
        } ].concat(P.prototype.action_icons_def),
        to_dict: E.prototype.to_dict,
        add_drawable: E.prototype.add_drawable,
        unpack_drawables: E.prototype.unpack_drawables,
        config_onchange: function() {
            this.set_name(this.config.get_value("name")), this.request_draw({
                clear_tile_cache: !0
            });
        },
        on_resize: function() {
            var b = this.visible_height_px;
            a.each(this.drawables, function(a) {
                a.visible_height_px = b;
            }), O.prototype.on_resize.call(this);
        },
        change_mode: function(a) {
            P.prototype.change_mode.call(this, a);
            for (var b = 0; b < this.drawables.length; b++) this.drawables[b].change_mode(a);
        },
        init: function() {
            for (var a = [], b = 0; b < this.drawables.length; b++) a.push(this.drawables[b].init());
            var c = this;
            $.when.apply($, a).then(function() {
                c.enabled = !0, c.request_draw();
            });
        },
        update_icons: function() {
            this.action_icons.filters_icon.hide(), this.action_icons.tools_icon.hide(), this.action_icons.param_space_viz_icon.hide();
        },
        can_draw: D.prototype.can_draw,
        _get_drawables: function() {
            return this.drawables;
        },
        show_group: function() {
            for (var a, b = new F(this.view, this.container, {
                name: this.config.get_value("name")
            }), c = 0; c < this.drawables.length; c++) a = this.drawables[c], a.update_icons(), 
            b.add_drawable(a), a.container = b, b.content_div.append(a.container_div);
            this.container.replace_drawable(this, b, !0);
            b.request_draw({
                clear_tile_cache: !0
            });
        },
        before_draw: function() {
            var b = a.min(a.map(this.drawables, function(a) {
                return a.config.get_value("min_value");
            })), c = a.max(a.map(this.drawables, function(a) {
                return a.config.get_value("max_value");
            }));
            this.config.set_value("min_value", b), this.config.set_value("max_value", c), a.each(this.drawables, function(a) {
                a.config.set_value("min_value", b), a.config.set_value("max_value", c);
            });
        },
        update_all_min_max: function() {
            var b = this.config.get_value("min_value"), c = this.config.get_value("max_value");
            a.each(this.drawables, function(a) {
                a.config.set_value("min_value", b), a.config.set_value("max_value", c);
            }), this.request_draw({
                clear_tile_cache: !0
            });
        },
        postdraw_actions: function(a, b, c) {
            var d, e = -1;
            for (d = 0; d < a.length; d++) {
                var f = a[d].html_elt.find("canvas").height();
                f > e && (e = f);
            }
            for (d = 0; d < a.length; d++) {
                var g = a[d];
                g.html_elt.find("canvas").height() !== e && (this.draw_helper(g.region, c, {
                    force: !0,
                    height: e
                }), g.html_elt.remove());
            }
            var h = this, i = function() {
                h.update_all_min_max();
            };
            this._add_yaxis_label("min", i), this._add_yaxis_label("max", i);
        }
    });
    var S = function(a) {
        P.call(this, a, {
            content_div: a.top_labeltrack
        }, {
            resize: !1,
            header: !1
        }), this.left_offset = a.canvas_manager.char_width_px, this.container_div.addClass("reference-track"), 
        this.data_url = galaxy_config.root + "api/genomes/" + this.view.dbkey, this.data_url_extra_params = {
            reference: !0
        }, this.data_manager = new b.GenomeReferenceDataManager({
            data_url: this.data_url,
            can_subset: this.can_subset
        }), this.hide_contents();
    };
    l(S.prototype, D.prototype, P.prototype, {
        config_params: a.union(D.prototype.config_params, [ {
            key: "height",
            type: "int",
            default_value: 13,
            hidden: !0
        } ]),
        init: function() {
            this.data_manager.clear(), this.enabled = !0;
        },
        predraw_init: function() {},
        can_draw: D.prototype.can_draw,
        draw_helper: function(a, b, c) {
            var d, e = this.tiles_div.is(":visible"), f = null;
            return b > this.view.canvas_manager.char_width_px ? (this.tiles_div.show(), d = !0, 
            f = P.prototype.draw_helper.call(this, a, b, c)) : (d = !1, this.tiles_div.hide()), 
            e !== d && this.view.resize_viewport(), f;
        },
        can_subset: function() {
            return !0;
        },
        draw_tile: function(a, b, c, d, e) {
            var f = this.data_manager.subset_entry(a, d), g = f.data, h = b.canvas;
            b.font = b.canvas.manager.default_font, b.textAlign = "center";
            for (var i = 0, j = g.length; j > i; i++) b.fillStyle = this.view.get_base_color(g[i]), 
            b.fillText(g[i], Math.floor(i * e), 10);
            return new L(this, d, e, h, f);
        }
    });
    var T = function(a, b, d) {
        this.mode = "Histogram", P.call(this, a, b, d), this.data_manager = new c.BBIDataManager({
            dataset: this.dataset
        });
    };
    l(T.prototype, D.prototype, P.prototype, {
        display_modes: C,
        config_params: a.union(D.prototype.config_params, [ {
            key: "color",
            label: "Color",
            type: "color"
        }, {
            key: "min_value",
            label: "Min Value",
            type: "float",
            default_value: void 0
        }, {
            key: "max_value",
            label: "Max Value",
            type: "float",
            default_value: void 0
        }, {
            key: "mode",
            type: "string",
            default_value: this.mode,
            hidden: !0
        }, {
            key: "height",
            type: "int",
            default_value: 30,
            hidden: !0
        } ]),
        config_onchange: function() {
            this.set_name(this.config.get_value("name")), this.request_draw({
                clear_tile_cache: !0
            });
        },
        before_draw: function() {},
        draw_tile: function(a, b, c, d, e) {
            return this._draw_line_track_tile(a, b, c, d, e);
        },
        can_subset: function(a) {
            return a.data[1][0] - a.data[0][0] === 1;
        },
        postdraw_actions: function() {
            this._add_yaxis_label("max"), this._add_yaxis_label("min");
        }
    });
    var U = function(a, b, c) {
        this.mode = "Heatmap", P.call(this, a, b, c);
    };
    l(U.prototype, D.prototype, P.prototype, {
        display_modes: [ "Heatmap" ],
        config_params: a.union(D.prototype.config_params, [ {
            key: "pos_color",
            label: "Positive Color",
            type: "color",
            default_value: "#FF8C00"
        }, {
            key: "neg_color",
            label: "Negative Color",
            type: "color",
            default_value: "#4169E1"
        }, {
            key: "min_value",
            label: "Min Value",
            type: "int",
            default_value: void 0
        }, {
            key: "max_value",
            label: "Max Value",
            type: "int",
            default_value: void 0
        }, {
            key: "mode",
            type: "string",
            default_value: this.mode,
            hidden: !0
        }, {
            key: "height",
            type: "int",
            default_value: 500,
            hidden: !0
        } ]),
        config_onchange: function() {
            this.set_name(this.config.get_value("name")), this.request_draw({
                clear_tile_cache: !0
            });
        },
        predraw_init: function() {
            var a = this;
            return $.getJSON(a.dataset.url(), {
                data_type: "data",
                stats: !0,
                chrom: a.view.chrom,
                low: 0,
                high: a.view.max_high,
                hda_ldda: a.dataset.get("hda_ldda")
            }, function(a) {
                a.data;
            });
        },
        draw_tile: function(a, b, c, d, e) {
            var f = b.canvas, h = new g.DiagonalHeatmapPainter(a.data, d.get("start"), d.get("end"), this.config.to_key_value_dict(), c);
            return h.draw(b, f.width, f.height, e), new L(this, d, e, f, a.data);
        }
    });
    var V = function(a, b, c) {
        P.call(this, a, b, c), this.container_div.addClass("feature-track"), this.summary_draw_height = 30, 
        this.slotters = {}, this.start_end_dct = {}, this.left_offset = 200, this.set_painter_from_config();
    };
    l(V.prototype, D.prototype, P.prototype, {
        display_modes: [ "Auto", "Coverage", "Dense", "Squish", "Pack" ],
        config_params: a.union(D.prototype.config_params, [ {
            key: "block_color",
            label: "Block color",
            type: "color"
        }, {
            key: "reverse_strand_color",
            label: "Antisense strand color",
            type: "color"
        }, {
            key: "label_color",
            label: "Label color",
            type: "color",
            default_value: "black"
        }, {
            key: "show_counts",
            label: "Show summary counts",
            type: "bool",
            default_value: !0,
            help: "Show the number of items in each bin when drawing summary histogram"
        }, {
            key: "min_value",
            label: "Histogram minimum",
            type: "float",
            default_value: null,
            help: "clear value to set automatically"
        }, {
            key: "max_value",
            label: "Histogram maximum",
            type: "float",
            default_value: null,
            help: "clear value to set automatically"
        }, {
            key: "connector_style",
            label: "Connector style",
            type: "select",
            default_value: "fishbones",
            options: [ {
                label: "Line with arrows",
                value: "fishbone"
            }, {
                label: "Arcs",
                value: "arcs"
            } ]
        }, {
            key: "mode",
            type: "string",
            default_value: this.mode,
            hidden: !0
        }, {
            key: "height",
            type: "int",
            default_value: 0,
            hidden: !0
        } ]),
        config_onchange: function() {
            this.set_name(this.config.get_value("name")), this.set_painter_from_config(), this.request_draw({
                clear_tile_cache: !0
            });
        },
        set_painter_from_config: function() {
            this.painter = "arcs" === this.config.get_value("connector_style") ? g.ArcLinkedFeaturePainter : g.LinkedFeaturePainter;
        },
        postdraw_actions: function(b, c, d, e) {
            P.prototype.postdraw_actions.call(this, b, c, d, e);
            var f, g = this, h = a.filter(b, function(a) {
                return a instanceof M;
            });
            if (0 === h.length) {
                var i = {};
                a.each(a.pluck(b, "incomplete_features"), function(b) {
                    a.each(b, function(a) {
                        i[a[0]] = a;
                    });
                });
                var j = this;
                a.each(b, function(b) {
                    var c = a.omit(i, a.map(b.incomplete_features, function(a) {
                        return a[0];
                    }));
                    if (c = a.omit(c, a.keys(b.other_tiles_features_drawn)), 0 !== a.size(c)) {
                        var d = {
                            data: a.values(c)
                        }, e = j.view.canvas_manager.new_canvas(), f = e.getContext("2d");
                        e.height = Math.max(b.canvas.height, j.get_canvas_height(d, b.mode, b.w_scale, 100)), 
                        e.width = b.canvas.width, f.drawImage(b.canvas, 0, 0), f.translate(g.left_offset, 0);
                        var h = j.draw_tile(d, f, b.mode, b.region, b.w_scale, b.seq_data);
                        $(b.canvas).replaceWith($(h.canvas)), b.canvas = e, a.extend(b.other_tiles_features_drawn, i);
                    }
                });
            }
            if (g.filters_manager) {
                var k, l = g.filters_manager.filters;
                for (k = 0; k < l.length; k++) l[k].update_ui_elt();
                var m, n, o = !1;
                for (f = 0; f < b.length; f++) if (b[f].data.length) for (m = b[f].data[0], k = 0; k < l.length; k++) if (n = l[k], 
                n.applies_to(m) && n.min !== n.max) {
                    o = !0;
                    break;
                }
                g.filters_available !== o && (g.filters_available = o, g.filters_available || g.filters_manager.hide(), 
                g.update_icons());
            }
            if (b[0] instanceof N) {
                var p = !0;
                for (f = 0; f < b.length; f++) if (!b[f].all_slotted) {
                    p = !1;
                    break;
                }
                this.action_icons.show_more_rows_icon.toggle(!p);
            } else this.action_icons.show_more_rows_icon.hide();
        },
        update_auto_mode: function(a) {
            "Auto" === this.mode && ("no_detail" === a && (a = "feature spans"), this.action_icons.mode_icon.attr("title", "Set display mode (now: Auto/" + a + ")"));
        },
        incremental_slots: function(a, b, c) {
            var d = this.view.canvas_manager.dummy_context, e = this.slotters[a];
            return e && e.mode === c || (e = new f.FeatureSlotter(a, c, q, function(a) {
                return d.measureText(a);
            }), this.slotters[a] = e), e.slot_features(b);
        },
        get_mode: function(a) {
            return mode = "no_detail" === a.extra_info || this.is_overview ? "no_detail" : this.view.high - this.view.low > r ? "Squish" : "Pack", 
            mode;
        },
        get_canvas_height: function(a, b, c, d) {
            if ("Coverage" === b || "bigwig" === a.dataset_type) return this.summary_draw_height;
            var e = this.incremental_slots(c, a.data, b), f = new this.painter(null, null, null, this.config.to_key_value_dict(), b);
            return Math.max(this.min_height_px, f.get_required_height(e, d));
        },
        draw_tile: function(a, b, c, d, e, f, g) {
            var h = this, i = b.canvas, j = d.get("start"), k = d.get("end"), l = this.left_offset;
            if ("bigwig" === a.dataset_type) return this._draw_line_track_tile(a, b, c, d, e);
            var m = [], n = this.slotters[e].slots;
            if (all_slotted = !0, a.data) for (var o = this.filters_manager.filters, p = 0, q = a.data.length; q > p; p++) {
                for (var r, s = a.data[p], t = !1, u = 0, v = o.length; v > u; u++) if (r = o[u], 
                r.update_attrs(s), !r.keep(s)) {
                    t = !0;
                    break;
                }
                t || (m.push(s), s[0] in n || (all_slotted = !1));
            }
            var w = this.filters_manager.alpha_filter ? new K(this.filters_manager.alpha_filter) : null, x = this.filters_manager.height_filter ? new K(this.filters_manager.height_filter) : null, y = new this.painter(m, j, k, this.config.to_key_value_dict(), c, w, x, f, function(a) {
                return h.view.get_base_color(a);
            }), z = null;
            if (b.fillStyle = this.config.get_value("block_color"), b.font = b.canvas.manager.default_font, 
            b.textAlign = "right", a.data) {
                var A = y.draw(b, i.width, i.height, e, n);
                z = A.feature_mapper, incomplete_features = A.incomplete_features, z.translation = -l;
            }
            return g ? void 0 : new N(h, d, e, i, a.data, c, a.message, all_slotted, z, incomplete_features, f);
        }
    });
    var W = function(a, b, c) {
        P.call(this, a, b, c), this.painter = g.VariantPainter, this.summary_draw_height = 30, 
        this.left_offset = 30;
    };
    l(W.prototype, D.prototype, P.prototype, {
        display_modes: [ "Auto", "Coverage", "Dense", "Squish", "Pack" ],
        config_params: a.union(D.prototype.config_params, [ {
            key: "color",
            label: "Histogram color",
            type: "color"
        }, {
            key: "show_sample_data",
            label: "Show sample data",
            type: "bool",
            default_value: !0
        }, {
            key: "show_labels",
            label: "Show summary and sample labels",
            type: "bool",
            default_value: !0
        }, {
            key: "summary_height",
            label: "Locus summary height",
            type: "float",
            default_value: 20
        }, {
            key: "mode",
            type: "string",
            default_value: this.mode,
            hidden: !0
        }, {
            key: "height",
            type: "int",
            default_value: 0,
            hidden: !0
        } ]),
        config_onchange: function() {
            this.set_name(this.config.get_value("name")), this.request_draw({
                clear_tile_cache: !0
            });
        },
        draw_tile: function(a, b, c, d, e) {
            if ("bigwig" === a.dataset_type) return this._draw_line_track_tile(a, b, "Histogram", d, e);
            var f = this.view, g = new this.painter(a.data, d.get("start"), d.get("end"), this.config.to_key_value_dict(), c, function(a) {
                return f.get_base_color(a);
            });
            return g.draw(b, b.canvas.width, b.canvas.height, e), new L(this, d, e, b.canvas, a.data);
        },
        get_canvas_height: function(a, b) {
            if ("bigwig" === a.dataset_type) return this.summary_draw_height;
            var c = this.dataset.get_metadata("sample_names") ? this.dataset.get_metadata("sample_names").length : 0;
            0 === c && 0 !== a.data.length && (c = a.data[0][7].match(/,/g), c = null === c ? 1 : c.length + 1);
            var d = new this.painter(null, null, null, this.config.to_key_value_dict(), b);
            return d.get_required_height(c);
        },
        predraw_init: function() {
            var a = [ O.prototype.predraw_init.call(this) ];
            return this.dataset.get_metadata("sample_names") || a.push(this.dataset.fetch()), 
            a;
        },
        postdraw_actions: function(b, c, d, e) {
            P.prototype.postdraw_actions.call(this, b, c, d, e);
            var f = a.filter(b, function(a) {
                return a instanceof M;
            }), g = this.dataset.get_metadata("sample_names");
            if (0 === f.length && this.config.get_value("show_labels") && g && g.length > 1) {
                var h;
                if (0 === this.container_div.find(".yaxislabel.variant").length && (h = this.config.get_value("summary_height") / 2, 
                this.tiles_div.prepend($("<div/>").text("Summary").addClass("yaxislabel variant top").css({
                    "font-size": h + "px",
                    top: (this.config.get_value("summary_height") - h) / 2 + "px"
                })), this.config.get_value("show_sample_data"))) {
                    var i = g.join("<br/>");
                    this.tiles_div.prepend($("<div/>").html(i).addClass("yaxislabel variant top sample").css({
                        top: this.config.get_value("summary_height")
                    }));
                }
                h = ("Squish" === this.mode ? 5 : 10) + "px", $(this.tiles_div).find(".sample").css({
                    "font-size": h,
                    "line-height": h
                }), $(this.tiles_div).find(".yaxislabel").css("color", this.config.get_value("label_color"));
            } else this.container_div.find(".yaxislabel.variant").remove();
        }
    });
    var X = function(a, b, c) {
        V.call(this, a, b, c), this.painter = g.ReadPainter, this.update_icons();
    };
    l(X.prototype, D.prototype, P.prototype, V.prototype, {
        config_params: a.union(D.prototype.config_params, [ {
            key: "block_color",
            label: "Histogram color",
            type: "color"
        }, {
            key: "detail_block_color",
            label: "Sense strand block color",
            type: "color",
            default_value: "#AAAAAA"
        }, {
            key: "reverse_strand_color",
            label: "Antisense strand block color",
            type: "color",
            default_value: "#DDDDDD"
        }, {
            key: "label_color",
            label: "Label color",
            type: "color",
            default_value: "black"
        }, {
            key: "show_insertions",
            label: "Show insertions",
            type: "bool",
            default_value: !1
        }, {
            key: "show_differences",
            label: "Show differences only",
            type: "bool",
            default_value: !0
        }, {
            key: "show_counts",
            label: "Show summary counts",
            type: "bool",
            default_value: !0
        }, {
            key: "mode",
            type: "string",
            default_value: this.mode,
            hidden: !0
        }, {
            key: "min_value",
            label: "Histogram minimum",
            type: "float",
            default_value: null,
            help: "clear value to set automatically"
        }, {
            key: "max_value",
            label: "Histogram maximum",
            type: "float",
            default_value: null,
            help: "clear value to set automatically"
        }, {
            key: "height",
            type: "int",
            default_value: 0,
            hidden: !0
        } ]),
        config_onchange: function() {
            this.set_name(this.config.get_value("name")), this.request_draw({
                clear_tile_cache: !0
            });
        }
    });
    var Y = {
        CompositeTrack: R,
        DrawableGroup: F,
        DiagonalHeatmapTrack: U,
        FeatureTrack: V,
        LineTrack: T,
        ReadTrack: X,
        VariantTrack: W,
        VcfTrack: W
    }, Z = function(a, b, c) {
        if ("copy" in a) return a.copy(c);
        var d = a.obj_type;
        return d || (d = a.track_type), new Y[d](b, c, a);
    };
    return {
        TracksterView: G,
        DrawableGroup: F,
        LineTrack: T,
        FeatureTrack: V,
        DiagonalHeatmapTrack: U,
        ReadTrack: X,
        VariantTrack: W,
        CompositeTrack: R,
        object_from_template: Z
    };
});