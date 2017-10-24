module.exports = {
    throwParam: (message) => {
        throw new Error(message)
    },

    /**
     * functional high resolution counter,
     * @returns {function()} that returns length since creation (
     */
    hrMeasure: () => {
        // return function that returns time between creation
        // and end

        const hrstart = process.hrtime()
        return () => {
            const hrend = process.hrtime(hrstart)
            // convert second/nanosecondresult to seconds and round to two decimals
            return hrend[0] + (hrend[1] / 1000000000).toFixed(2)
        }
    }

}
