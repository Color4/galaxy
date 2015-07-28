define( ["viz/visualization", "libs/bbi/spans", "libs/bbi/sha1", "libs/bbi/bin", "libs/bbi/jszlib", "libs/bbi/bigwig"],
        function(visualization, spans, sha1, bin, jszlib, bigwig) {

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
            bigwig.makeBwg(new bin.URLFetchable(url), function(bb, err) {
                bb.readWigData(region.get("chrom"), region.get("start"), region.get("end"), function(data) {
                    // Transform data into "bigwig" format.
                    var result = data.map(function(d) {
                            // Result is a 2-element array with [chrom_pos, score]
                            return [
                                // HACK: LineTrack painters use a single point rather than min/max. For now,
                                // create single coordinate by using coordinate at midpoint of span. LineTrack
                                // painter should be enhanced to use min, max attributes when available.
                                Math.floor( d.min + (d.max - d.min)/2  ),
                                d.score
                            ];
                        }),
                        entry = {
                            data: result,
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
