let getRenderer = (globalConfigs, mathModule) => {
    let requires =
        globalConfigs.height &&
        globalConfigs.width &&
        globalConfigs.unit &&
        globalConfigs.canvas &&
        globalConfigs.canvas.element &&
        globalConfigs.canvas.context;

    globalConfigs.defaultUnit = globalConfigs.unit;

    if (!requires)
        return false;

    let calculation = {
        getPointsListByGraph(fromX, toX, xStep, graphCallback) {
            if (fromX > toX) return false;
            let points = [];

            for (let currentX = fromX; currentX < toX; currentX += xStep) {
                points.push({
                    x: currentX,
                    y: graphCallback(currentX)
                });
            }

            return points;
        },
        circle: {
            isInside(pointToCheck, circle) {
                return Math.pow(pointToCheck.x - circle.x, 2) + Math.pow(pointToCheck.y - circle.y, 2) <= Math.pow(circle
                    .radius, 2);
            }
        },
        linear: {
            getX(slope, intercept, y) {
                return (y - intercept) / slope;
            },
            getY(slope, intercept, x) {
                return slope * x + intercept;
            }
        },
        color: {
            getRandom() {
                let letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }
        },
        convert: {
            toScreenUnits(data) {
                let converter = point => ({
                    x: globalConfigs.width / 2 + point.x * globalConfigs.unit,
                    y: globalConfigs.height / 2 - point.y * globalConfigs.unit
                });

                if (Array.isArray(data)) {
                    return data.map(converter);
                }

                return converter(data);

            },
            toGraphUnits(data) {
                let converter = point => ({
                    x: point.x / globalConfigs.unit - globalConfigs.width / (2 * globalConfigs.unit),
                    y: -1 * (point.y / globalConfigs.unit - globalConfigs.height / (2 * globalConfigs.unit))
                });

                if (Array.isArray(data)) {
                    return data.map(converter);
                }

                return converter(data);
            },
            getCanvasEdgesInGraphUnits() {
                let xConvector = xScreen => xScreen / globalConfigs.unit - globalConfigs.width / 2 / globalConfigs.unit;
                let yConvector = yScreen => -1 * (yScreen / globalConfigs.unit - globalConfigs.height / 2 / globalConfigs.unit);

                return {
                    topLeft: {
                        x: xConvector(0),
                        y: yConvector(0)
                    },
                    topRight: {
                        x: xConvector(globalConfigs.width),
                        y: yConvector(0)
                    },
                    bottomLeft: {
                        x: xConvector(0),
                        y: yConvector(globalConfigs.height)
                    },
                    bottomRight: {
                        x: xConvector(globalConfigs.width),
                        y: yConvector(globalConfigs.height)
                    }
                };
            }
        }
    };

    let draw = {
        customGraph(func, configs) {
            configs = configs || {};
            configs.drawFrom = configs.drawFrom || -globalConfigs.width / globalConfigs.unit;
            configs.drawTo = configs.drawTo || globalConfigs.width / globalConfigs.unit;
            configs.step = configs.step || 0.3;
            let points = [];

            for (let i = configs.drawFrom; i <= configs.drawTo; i += configs.step) {
                points.push({
                    x: i,
                    y: func(i)
                });
            }

            draw.curveLine(points);
        },
        polynomialGraph(coefficients, configs) {
            configs = configs || {};
            configs.thickness = configs.thickness || 2;
            configs.color = configs.color || 'black';
            configs.drawFrom = configs.drawFrom || -globalConfigs.width / globalConfigs.unit;
            configs.drawTo = configs.drawTo || globalConfigs.width / globalConfigs.unit;
            configs.step = configs.step || 0.3;

            let points = calculation.getPointsListByGraph(configs.drawFrom, configs.drawTo, configs.step, 
                x => coefficients.reduce((acc, coef, i) => acc + coef * Math.pow(x, i), 0));
        
            draw.curveLine(points);
        },
        lineGraph(slope, intercept, configs) {
            configs = configs || {};
            configs.thickness = configs.thickness || 2;
            configs.color = configs.color || 'black';
            configs.drawFrom = configs.drawFrom || -20;
            configs.drawTo = configs.drawTo || 20;
            configs.step = configs.step || 0.3;

            let points = calculation.getPointsListByGraph(configs.drawFrom, configs.drawTo, configs.step, x => slope * x + intercept);

            // let points = calculation.convert.toScreenUnits([{
            //     x: (canvasEdges.topRight.y - intercept) / slope,
            //     y: slope * canvasEdges.topRight.x + intercept
            // }, {
            //     x: (canvasEdges.bottomLeft.y - intercept) / slope,
            //     y: slope * canvasEdges.bottomLeft.x + intercept
            // }]);

            draw.curveLine(points);
        },
        curveLine(dots, configs) {
            configs = configs || {};
            globalConfigs.canvas.context.strokeStyle = configs.color || 'red';

            let convertedDots = dots.map(dot => ({
                ...dot,
                ...calculation.convert.toScreenUnits(dot)
            }));

            globalConfigs.canvas.context.moveTo(convertedDots[0].x, convertedDots[0].y);
            globalConfigs.canvas.context.beginPath();

            convertedDots.forEach(dot => {
                globalConfigs.canvas.context.lineTo(dot.x, dot.y);
            });
            globalConfigs.canvas.context.stroke();
        },
        dots(dots, configs) {
            configs = configs || {};

            configs.color = configs.color || calculation.color.getRandom();
            configs.thickness = configs.thickness || 10;

            let convertedDots = dots.map(dot => ({
                ...dot,
                ...calculation.convert.toScreenUnits(dot)
            }));

            convertedDots.forEach(dot => {
                if (!dot.color) {
                    dot.color = calculation.color.getRandom();
                }

                globalConfigs.canvas.context.fillStyle = dot.color;
                globalConfigs.canvas.context.beginPath();
                globalConfigs.canvas.context.arc(dot.x, dot.y, configs.thickness / 2, 0, Math.PI * 2);
                globalConfigs.canvas.context.closePath();
                globalConfigs.canvas.context.fill();

                globalConfigs.canvas.context.strokeStyle = 'black';
                globalConfigs.canvas.context.beginPath();
                globalConfigs.canvas.context.arc(dot.x, dot.y, configs.thickness / 2, 0, Math.PI * 2);
                globalConfigs.canvas.context.closePath();
                globalConfigs.canvas.context.stroke();
            });
        },
        arrows(configs) {
            configs = configs || {};

            configs.color = configs.color || 'black';
            configs.thickness = configs.thickness || 2;

            globalConfigs.canvas.context.fillStyle = configs.color;
            globalConfigs.canvas.context.fillRect(0, globalConfigs.height / 2 - configs.thickness / 2, globalConfigs.width, configs.thickness);
            globalConfigs.canvas.context.fillRect(globalConfigs.width / 2 - configs.thickness / 2, 0, configs.thickness, globalConfigs.height);

            globalConfigs.canvas.context.strokeStyle = configs.color;
            globalConfigs.canvas.context.fillRect(globalConfigs.width / 2 + globalConfigs.defaultUnit - 1, globalConfigs.height / 2 - 8, 3, 16);

            globalConfigs.canvas.context.font = "20px Georgia";
            globalConfigs.canvas.context.fillText(mathModule.round(globalConfigs.defaultUnit / globalConfigs.unit, 5),
                globalConfigs.width / 2 + globalConfigs.defaultUnit - 10, globalConfigs.height / 2 + 30);
        },
        clearCanvas() {
            globalConfigs.canvas.context.fillStyle = 'white';
            globalConfigs.canvas.context.fillRect(0, 0, globalConfigs.width, globalConfigs.height);

            globalConfigs.canvas.context.strokeStyle = 'black';
            globalConfigs.canvas.context.strokeRect(0, 0, globalConfigs.width, globalConfigs.height);
        },
        mapNet(configs) {
            configs = configs || {};

            configs.thickness = configs.thickness || 1;
            configs.measure = configs.measure || globalConfigs.defaultUnit;
            configs.color = configs.color || 'black';

            globalConfigs.canvas.context.fillStyle = configs.color;

            for (let i = 0; i * configs.measure <= globalConfigs.width; i++) {
                globalConfigs.canvas.context.fillRect(i * configs.measure, 0, configs.thickness, globalConfigs.height);
            }

            for (let i = 0; i * configs.measure <= globalConfigs.height; i++) {
                globalConfigs.canvas.context.fillRect(0, i * configs.measure, globalConfigs.width, configs.thickness);
            }
        },
        zoom(value, zoomPoint) {
            if (globalConfigs.unit + value >= 5 && globalConfigs.unit + value <= 100) {
                globalConfigs.unit += value;
            }
        }
    };

    draw.exponentialGraph = (alpha, beta) => {
        let points = calculation.getPointsListByGraph(-20, 20, 0.1, x => alpha * Math.exp(beta * x));

        draw.curveLine(points);
    };

    return {
        draw,
        calculation
    };
};