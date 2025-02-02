import {
    getInfoFromThemeName,
    makeGradient,
    getFontConfig,
    getAxisThemeConfig,
} from "./chart-theme";

import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

/**
 * @param {String} id
 * @param {Array} values
 * @param {Array} labels
 * @param {Boolean} grid
 * @param {Boolean} tooltips
 * @param {Array<Object{name, mode}>} theme
 * @param {Number} time
 * @param {String} currency
 * @return {Object}
 */
const CustomChart = (
    id,
    values,
    labels,
    grid,
    tooltips,
    theme,
    time,
    currency
) => {
    return {
        time: time,
        chart: null,
        currency: currency || "USD",

        getCanvas() {
            return this.$refs[id];
        },

        getCanvasContext() {
            return this.getCanvas().getContext("2d");
        },

        getRangeFromValues(values, margin = 0) {
            const max = Math.max.apply(Math, values);
            const min = Math.min.apply(Math, values);
            const _margin = max * margin;

            return {
                min: min - _margin,
                max: max + _margin,
            };
        },

        getCurrencyValue(value) {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: this.currency,
            }).format(value);
        },

        resizeChart() {
            this.updateChart();
        },

        updateChart() {
            this.chart.datasets = this.loadData();
            this.chart.labels = labels;
            this.chart.update();
        },

        themeMode() {
            if (theme.mode === "auto") {
                return ["light", "dark"].includes(localStorage.theme)
                    ? localStorage.theme
                    : "light";
            }

            return theme.mode;
        },

        loadData() {
            const datasets = [];

            if (values.length === 0) {
                values = [0, 0];
                labels = [0, 1];
            }

            if (Array.isArray(values) && !values[0].hasOwnProperty("data")) {
                values = [values];
            }

            values.forEach((value, key) => {
                let themeName = value.type === "bar" ? "grey" : theme.name;
                let graphic = getInfoFromThemeName(themeName, this.themeMode());
                let backgroundColor = graphic.backgroundColor;
                if (backgroundColor.hasOwnProperty("gradient")) {
                    backgroundColor = makeGradient(
                        this.getCanvas(),
                        backgroundColor.gradient
                    );
                }

                datasets.push({
                    fill: true,
                    stack: "combined",
                    label: value.name || "",
                    data: value.data || value,
                    type: value.type || "line",
                    backgroundColor:
                        value.type === "bar"
                            ? graphic.borderColor
                            : backgroundColor,
                    borderColor:
                        value.type === "bar"
                            ? "transparent"
                            : graphic.borderColor,
                    borderWidth:
                        value.type === "bar"
                            ? "transparent"
                            : graphic.borderWidth,
                    cubicInterpolationMode: "monotone",
                    tension: graphic.lineTension,
                    pointRadius: graphic.pointRadius,
                    pointBackgroundColor: graphic.pointBackgroundColor,
                    pointHoverRadius: tooltips ? graphic.pointHoverRadius : 0,
                    pointHoverBorderWidth: tooltips
                        ? graphic.pointHoverBorderWidth
                        : 0,
                    pointHoverBorderColor: tooltips ? graphic.borderColor : 0,
                    pointHoverBackgroundColor: tooltips
                        ? graphic.pointHoverBackgroundColor
                        : 0,
                });
            });

            return datasets;
        },

        loadYAxes() {
            const axes = [];

            values.forEach((value, key) => {
                let range = this.getRangeFromValues(value, 0.01);
                axes.push({
                    display: grid && key === 0,
                    type: "linear",
                    ticks: {
                        ...getFontConfig("axis", this.themeMode()),
                        padding: 15,
                        display: grid && key === 0,
                        suggestedMax: range.max,
                        callback: (value, index, data) =>
                            this.getCurrencyValue(value),
                    },
                    grid: {
                        display: grid && key === 0,
                        drawBorder: false,
                        color: getAxisThemeConfig(this.themeMode()).y.color,
                    },
                });
            });

            return axes;
        },

        init() {
            if (this.chart) {
                this.chart.destroy();
            } else if (Chart.getChart(this.getCanvas())) {
                Chart.getChart(this.getCanvas()).destroy();
            }

            this.$watch("time", () => this.updateChart());
            window.addEventListener("resize", () =>
                window.livewire.emit("updateChart")
            );

            const data = {
                labels: labels,
                datasets: this.loadData(),
            };

            const options = {
                spanGaps: true,
                normalized: true,
                responsive: true,
                maintainAspectRatio: false,
                showScale: grid,
                animation: { duration: 300, easing: "easeOutQuad" },
                interaction: {
                    mode: "nearest",
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: tooltips,
                        external: this.tooltip,
                        displayColors: false,
                        callbacks: {
                            title: (items) => {},
                            label: (context) =>
                                this.getCurrencyValue(context.raw),
                            labelTextColor: (context) =>
                                getFontConfig("tooltip", this.themeMode())
                                    .fontColor,
                        },
                        backgroundColor: getFontConfig(
                            "tooltip",
                            this.themeMode()
                        ).backgroundColor,
                    },
                },
                hover: {
                    mode: "nearest",
                    intersect: false,
                    axis: "x",
                },
                scales: {
                    yAxes: {
                        ...this.loadYAxes()[0],
                        position: "right",
                    },
                    xAxes: {
                        display: grid,
                        type: "category",
                        labels: labels,
                        ticks: {
                            display: grid,
                            includeBounds: true,
                            padding: 10,
                            ...getFontConfig("axis", this.themeMode()),
                        },
                        grid: {
                            display: grid,
                            drawBorder: false,
                            color: getAxisThemeConfig(this.themeMode()).x.color,
                        },
                    },
                },
            };

            this.chart = new Chart(this.getCanvasContext(), { data, options });
        },
    };
};

export default CustomChart;
