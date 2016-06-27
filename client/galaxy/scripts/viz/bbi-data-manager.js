define( ["viz/visualization", "libs/bbi/bigwig"],
        function(visualization, bigwig) {

    /**
     * Data manager for BBI datasets/files, including BigWig and BigBed.
     */
    var BBIDataManager = visualization.GenomeDataManager.extend({

        /**
         * Load data from server and manages data entries. Adds a Deferred to manager
         * for region; when data becomes available, replaces Deferred with data.
         * Returns the Deferred that resolves when data is available.
         */
        load_data: function(region, mode, resolution, extra_params) {
            var deferred = $.Deferred();
            this.set_data(region, deferred);

            var url = galaxy_config.root + 'datasets/' + this.get('dataset').id + '/display',
                self = this;
                var promise = new $.Deferred();
                $.when(bigwig.makeBwg(url)).then(function(bb, err) {
                    // Include 5 bps after region to ensure data is available for drawing entire region.
                    $.when(bb.readWigData(region.get("chrom"), region.get("start"), region.get("end")+5)).then(function(data) {
                        // Convert from wiggle 1-based coordinate system to Trackster 0-based coordinate system.
                        _.each(data, function(d) {
                            d.min -= 1;
                        });

                        var entry = {
                            data: data,
                            region: region,
                            dataset_type: 'bigwig'
                        };

                        self.set_data(region, entry);
                        deferred.resolve(entry);
                    });
                });

            return deferred;
        },
    });

    return {
        BBIDataManager: BBIDataManager
    };

});
