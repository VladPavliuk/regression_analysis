<template>
    <div>
        <canvas ref="graph-canvas"></canvas>
    </div>
</template>

<script>
import getRenderer from '../services/graphic/renderer.js'

export default {
    data() {
        return {
            canvas: {
                element: null,
                context: null,
                width: 600,
                height: 600
            },
            renderer: null
        };
    },
    mounted() {
        this.canvas.element = this.$refs['graph-canvas'];
        this.canvas.context = this.canvas.element.getContext('2d');
        this.canvas.element.width = this.canvas.width;
        this.canvas.element.height = this.canvas.height;

        this.renderer = getRenderer({
            width: this.canvas.element.width,
            height: this.canvas.element.height,
            unit: 20,
            canvas: {
                element: this.canvas.element,
                context: this.canvas.context
            }
        })
        
        this.clear();
        this.drawGraph(x => x*x);
        this.drawDot({
            x: 3,
            y: 3
        });
    },
    methods: {
        clear() {
            this.renderer.draw.clearCanvas();
            this.renderer.draw.mapNet();
            this.renderer.draw.arrows();
        },
        drawDots(dots) {
            this.renderer.draw.dots(dots);
        },
        drawDot(dot) {
            this.drawDots([dot]);
        },
        drawGraph(graphFunc) {
            this.renderer.draw.customGraph(graphFunc);
        },
        _graphDataUpdated() {
            this.$emit('graphDataUpdated');
        },
        _attachMouseEventsListeners() {
            let clickedDotIndex = null;
            let mousePressed = false;
            let mouseMoved = false;
            let isCursorOverAnyDot = false;

            this.canvas.element.addEventListener('mousemove', e => {
                let mousePosition = {
                    x: e.offsetX,
                    y: e.offsetY
                };

                let dotLocationLabelElement = document.getElementsByClassName('dot-location-label')[0];
                dotLocationLabelElement.style.top = e.y - 50 + 'px';
                dotLocationLabelElement.style.left = e.x + 30 + 'px';

                let pointToCheck = this.renderer.calculation.convert.toGraphUnits({
                    x: mousePosition.x,
                    y: mousePosition.y
                });

                globalData.dots.forEach(dot => {
                    let circle = {
                        x: dot.x,
                        y: dot.y,
                        radius: 6 / globalData.unit
                    };

                    if (this.renderer.calculation.circle.isInside(pointToCheck, circle)) {
                        dotLocationLabelElement.innerHTML = `(${dot.x}; ${dot.y})`;

                        isCursorOverAnyDot = true;
                        this.canvas.element.style.cursor = 'pointer';
                        dotLocationLabelElement.style.display = 'inline';
                    }
                });

                if (!isCursorOverAnyDot) {
                    this.canvas.element.style.cursor = 'auto';
                    dotLocationLabelElement.style.display = 'none';
                }
            });

            this.canvas.element.addEventListener("mousedown", e => {
                mousePressed = true;

                let dotPosition = this.renderer.calculation.convert.toGraphUnits({
                    x: e.offsetX,
                    y: e.offsetY
                });

                globalData.dots.forEach((dot, index) => {
                    let circle = {
                        x: dot.x,
                        y: dot.y,
                        radius: 6 / globalData.unit
                    };

                    if (this.renderer.calculation.circle.isInside(dotPosition, circle)) {
                        clickedDotIndex = index;
                    }
                });
            }, false);

            this.canvas.element.addEventListener('mousemove', e => {
                if (mousePressed) {
                    mouseMoved = true;
                }

                if (mousePressed) {
                    let dotPosition = this.renderer.calculation.convert.toGraphUnits({
                        x: e.offsetX,
                        y: e.offsetY
                    });

                    if (Number.isInteger(clickedDotIndex)) {
                        dotPosition.x = mathModule.round(dotPosition.x, 3);
                        dotPosition.y = mathModule.round(dotPosition.y, 3);
                        
                        let dotsCopy = copy(globalData.dots);
                        dotsCopy.splice(clickedDotIndex, 1);

                        let nearestPoint = dotsCopy.sort((prevDot, nextDot) => Math.abs(prevDot.x - dotPosition.x) - Math.abs(nextDot.x - dotPosition.x))[0];
                        let distanceToNearest = nearestPoint.x - dotPosition.x;
                        let deltha = 0.1;

                        if (distanceToNearest >= 0 && distanceToNearest < deltha) {
                            dotPosition.x = dotPosition.x + distanceToNearest + deltha;
                        } else if (distanceToNearest < 0 && distanceToNearest > -deltha) {
                            dotPosition.x = dotPosition.x + distanceToNearest - deltha;
                        }

                        this.canvas.element.style.cursor = 'move';
                        globalData.dots[clickedDotIndex] = {
                            ...globalData.dots[clickedDotIndex],
                            ...dotPosition
                        };
                    } else {
                        globalData.dots.forEach((dot, index) => {
                            let circle = {
                                x: dot.x,
                                y: dot.y,
                                radius: 6 / globalData.unit
                            };

                            if (this.renderer.calculation.circle.isInside(dotPosition, circle)) {
                                clickedDotIndex = index;
                            }
                        });
                    }

                    this._graphDataUpdated();
                }
            });

            this.canvas.element.addEventListener("mouseup", e => {
                clickedDotIndex = false;

                if (mousePressed && !mouseMoved) {
                    let dotPosition = this.renderer.calculation.convert.toGraphUnits({
                        x: e.offsetX,
                        y: e.offsetY
                    });

                    let isAnyDotHasBeenClicked = false;
                    globalData.dots.forEach((dot, index) => {
                        let circle = {
                            x: dot.x,
                            y: dot.y,
                            radius: 6 / globalData.unit
                        };

                        if (this.renderer.calculation.circle.isInside(dotPosition, circle)) {
                            isAnyDotHasBeenClicked = true;
                            globalData.removeDot(index);
                        }
                    });

                    if (isAnyDotHasBeenClicked) {
                        this._graphDataUpdated();
                        return;
                    }

                    dotPosition = {
                        x: mathModule.round(dotPosition.x, 3),
                        y: mathModule.round(dotPosition.y, 3),
                        color: this.renderer.calculation.color.getRandom()
                    };

                    globalData.addDots([dotPosition]);
                    this.renderer.draw.dots(globalData.dots);

                    this._graphDataUpdated();
                }

                mousePressed = false;
                mouseMoved = false;
            }, false);
        },
    } 
}
</script>

