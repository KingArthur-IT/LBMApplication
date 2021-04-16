/*
    Fluid flow simulation based on lattice Boltzmann method (D2Q9 model)
    Copyright (c) 2021 Artem Ostapenko
*/
class GLProgram {
    constructor(contex, vertexShader, fragmentShader) {
        this.gl = contex;
        this.uniforms = {};
        this.program = this.gl.createProgram();

        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw this.gl.getProgramInfoLog(this.program);
        }

        const uniformCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformName = this.gl.getActiveUniform(this.program, i).name;
            this.uniforms[uniformName] = this.gl.getUniformLocation(this.program, uniformName);
        }
    }

    use() {
        this.gl.useProgram(this.program);
    }
}
class Shaders{
    constructor(contex) {
        this.gl = contex;
        //shaders
        let vertexShader    = this.compileShader(this.gl.VERTEX_SHADER, this.vertexShaderCode);
        let initializeDistribution0Shader     = this.compileShader(this.gl.FRAGMENT_SHADER, this.initializeDistribution0ShaderCode);
        let initializeDistribution1Shader     = this.compileShader(this.gl.FRAGMENT_SHADER, this.initializeDistribution1ShaderCode);
        let initializeDistribution2Shader     = this.compileShader(this.gl.FRAGMENT_SHADER, this.initializeDistribution2ShaderCode);
        
        let calculateVelocityDencityShader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.calculateVelocityDencityShaderCode);
        
        let stream1Shader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.stream1ShaderCode);
        let stream2Shader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.stream2ShaderCode);
        let collision0Shader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.collision0ShaderCode);
        let collision1Shader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.collision1ShaderCode);
        let collision2Shader = this.compileShader(this.gl.FRAGMENT_SHADER, this.collision2ShaderCode);

        let calculateOutletVelocityShader = this.compileShader(this.gl.FRAGMENT_SHADER, this.calculateOutletVelocityShaderCode);
        let outletBC0Shader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.OutletBC0ShaderCode);
        let outletBC1Shader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.OutletBC1ShaderCode);
        let outletBC2Shader = this.compileShader(this.gl.FRAGMENT_SHADER, this.OutletBC2ShaderCode);
        let fluxVelShader         = this.compileShader(this.gl.FRAGMENT_SHADER, this.FluxVelocityShaderCode);
        let flux1Shader         = this.compileShader(this.gl.FRAGMENT_SHADER, this.FluxBC1ShaderCode);
        let flux2Shader         = this.compileShader(this.gl.FRAGMENT_SHADER, this.FluxBC2ShaderCode);        
        
        let displayShader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.displayShaderCode);
        let displayBodyShader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.displayBodyShaderCode);
        let displayGraphShader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.displayGraphShaderCode);

        let initializeCircleBodyShader   = this.compileShader(this.gl.FRAGMENT_SHADER, this.initializeCircleBodyShaderCode);

        //programs
        this.displayProgram         = new GLProgram(this.gl, vertexShader, displayShader);
        this.displayBodyProgram         = new GLProgram(this.gl, vertexShader, displayBodyShader);
        this.displayGraphProgram    = new GLProgram(this.gl, vertexShader, displayGraphShader);
        this.initializeDistribution0Program     = new GLProgram(this.gl, vertexShader, initializeDistribution0Shader);
        this.initializeDistribution1Program     = new GLProgram(this.gl, vertexShader, initializeDistribution1Shader);
        this.initializeDistribution2Program     = new GLProgram(this.gl, vertexShader, initializeDistribution2Shader);
        this.calculateVelocityDencityProgram    = new GLProgram(this.gl, vertexShader, calculateVelocityDencityShader);

        this.stream1Program         = new GLProgram(this.gl, vertexShader, stream1Shader);
        this.stream2Program         = new GLProgram(this.gl, vertexShader, stream2Shader);
        this.collision0Program         = new GLProgram(this.gl, vertexShader, collision0Shader);
        this.collision1Program         = new GLProgram(this.gl, vertexShader, collision1Shader);
        this.collision2Program         = new GLProgram(this.gl, vertexShader, collision2Shader);

        this.calculateOutletVelocityProgram = new GLProgram(this.gl, vertexShader, calculateOutletVelocityShader);
        this.outletBC0Program         = new GLProgram(this.gl, vertexShader, outletBC0Shader);
        this.outletBC1Program         = new GLProgram(this.gl, vertexShader, outletBC1Shader);
        this.outletBC2Program         = new GLProgram(this.gl, vertexShader, outletBC2Shader);
        this.fluxVelProgram         = new GLProgram(this.gl, vertexShader, fluxVelShader);
        this.flux1Program         = new GLProgram(this.gl, vertexShader, flux1Shader);
        this.flux2Program         = new GLProgram(this.gl, vertexShader, flux2Shader);     

        this.initializeCircleBodyProgram         = new GLProgram(this.gl, vertexShader, initializeCircleBodyShader);        
    }
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw this.gl.getShaderInfoLog(shader);
        }

        return shader;
    };
    //Shader codes
    get vertexShaderCode() {
        let vertexShaderCode = `
            precision highp float;

            attribute vec2 aPosition;
            varying vec2 vTextCoord;

            void main () {
                vTextCoord = aPosition * 0.5 + 0.5; 
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;
        return vertexShaderCode;
    }
    //Init
    get initializeDistribution0ShaderCode() {
        let initShader = `
            precision highp float;

            varying vec2 vTextCoord;

            void main () {
                float ux = 0.0;//0.1 * (1.0-4.0*(vTextCoord.y - 0.5)*(vTextCoord.y - 0.5));
                float uy = 0.0;
                float f0 = 4.0 * (1.0 - 1.5 * ux * ux - 1.5 * uy * uy) / 9.0;
                gl_FragColor = vec4(f0, 1.0, 1.0, 1.0);
            }
        `;
        return initShader;
    }
    get initializeDistribution1ShaderCode() {
        let initShader = `
            precision highp float;

            varying vec2 vTextCoord;

            void main () {
                float ux = 0.0;//0.1 * (1.0-4.0*(vTextCoord.y - 0.5)*(vTextCoord.y - 0.5));
                float uy = 0.0;
                
                float f1 = (1.0 + 3.0 * ux + 3.0 * ux * ux - 1.5 * uy * uy) / 9.0;
                float f2 = (1.0 + 3.0 * uy + 3.0 * uy * uy - 1.5 * ux * ux) / 9.0;
                float f3 = (1.0 - 3.0 * ux + 3.0 * ux * ux - 1.5 * uy * uy) / 9.0;
                float f4 = (1.0 - 3.0 * uy + 3.0 * uy * uy - 1.5 * ux * ux) / 9.0;
                
                gl_FragColor = vec4(f1, f2, f3, f4);
            }
        `;
        return initShader;
    }
    get initializeDistribution2ShaderCode() {
        let initShader = `
            precision highp float;

            varying vec2 vTextCoord;

            void main () {
                float ux = 0.0;//0.1 * (1.0-4.0*(vTextCoord.y - 0.5)*(vTextCoord.y - 0.5));
                float uy = 0.0;

                float f5 = (1.0 + 3.0 * ux + 3.0 * uy + 3.0 * ux * ux + 3.0 * uy * uy + 9.0 * ux * uy) / 36.0;
                float f6 = (1.0 - 3.0 * ux + 3.0 * uy + 3.0 * ux * ux + 3.0 * uy * uy - 9.0 * ux * uy) / 36.0;
                float f7 = (1.0 - 3.0 * ux - 3.0 * uy + 3.0 * ux * ux + 3.0 * uy * uy + 9.0 * ux * uy) / 36.0;
                float f8 = (1.0 + 3.0 * ux - 3.0 * uy + 3.0 * ux * ux + 3.0 * uy * uy - 9.0 * ux * uy) / 36.0;
                gl_FragColor = vec4(f5, f6, f7, f8);
            }
        `;
        return initShader;
    }
    //calculate/set velocity and dencity
    get calculateVelocityDencityShaderCode() {
        let calcShader = `
            precision highp float;

            varying vec2 vTextCoord;

            uniform sampler2D uDistribution0;
            uniform sampler2D uDistribution1;
            uniform sampler2D uDistribution2;
            uniform float c;            

            void main () {
                float f0 = texture2D(uDistribution0, vTextCoord).r;
                vec4 f14 = texture2D(uDistribution1, vTextCoord).rgba;
                vec4 f58 = texture2D(uDistribution2, vTextCoord).rgba;

                float rho = f0 + f14.r + f14.b + f14.g + f14.a + f58.r + f58.b + f58.g + f58.a;
                float ux = f14.r + f58.r + f58.a - f14.b - f58.g - f58.b;
                float uy = f14.g + f58.r + f58.g - f58.b - f58.a - f14.a;
                ux = c * ux / rho;
                uy = c * uy / rho;

                gl_FragColor = vec4(ux, uy, rho, 0.0);
            }
        `;
        return calcShader;        
    }
    get calculateOutletVelocityShaderCode() {
        let calcShader = `
            precision highp float;

            uniform sampler2D uDistribution0;
            uniform sampler2D uDistribution1;
            uniform sampler2D uDistribution2;
            uniform float c;
            varying vec2 vTextCoord;

            void main () {
                float f0 = texture2D(uDistribution0, vTextCoord).r;
                vec4 f14 = texture2D(uDistribution1, vTextCoord).rgba;
                vec4 f58 = texture2D(uDistribution2, vTextCoord).rgba;                
                
                if (vTextCoord.x >= 1.0 - 0.005)
                {
                    vec2 coord = vTextCoord; coord.x -= 0.005;
                    f0 = texture2D(uDistribution0, coord).r;
                    f14 = texture2D(uDistribution1, coord).rgba;
                    f58 = texture2D(uDistribution2, coord).rgba;
                }

                float rho = f0 + f14.r + f14.b + f14.g + f14.a + f58.r + f58.b + f58.g + f58.a;
                float ux = f14.r + f58.r + f58.a - f14.b - f58.g - f58.b;
                float uy = f14.g + f58.r + f58.g - f58.b - f58.a - f14.a;
                ux = c * ux / rho;
                uy = c * uy / rho;

                gl_FragColor = vec4(ux, uy, rho, 0.0);
            }
        `;
        return calcShader;        
    }
    get FluxVelocityShaderCode() {
        let fluxShader = `
            precision highp float;

            uniform sampler2D uDistribution0;
            uniform sampler2D uDistribution1;
            uniform sampler2D uDistribution2;
            varying vec2 vTextCoord;

            void main () {
                float f0 = texture2D(uDistribution0, vTextCoord).r;
                vec4 f14 = texture2D(uDistribution1, vTextCoord).rgba;
                vec4 f58 = texture2D(uDistribution2, vTextCoord).rgba;

                float rho = f0 + f14.r + f14.b + f14.g + f14.a + f58.r + f58.b + f58.g + f58.a;
                float ux = f14.r + f58.r + f58.a - f14.b - f58.g - f58.b;
                float uy = f14.g + f58.r + f58.g - f58.b - f58.a - f14.a;
                ux = ux / rho;
                uy = uy / rho;

                if (vTextCoord.x <= 0.005)
                {
                    rho = 1.0; 
                    ux = 0.1; uy = 0.0;
                }

                gl_FragColor = vec4(ux, uy, rho, 0.0);
            }
        `;
        return fluxShader;        
    }
    //display
    get displayShaderCode() {
        let displayShader = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uBodiesTexture;

            uniform sampler2D uVelocity;

            void main () {
                vec3 u = texture2D(uVelocity, vTextCoord).xyz;
                float scale = 14.0;
                float velMagnitude = sqrt( u.x*u.x + u.y*u.y );
                float color = 2.0 - scale*velMagnitude;
                if (color < 0.0) color = 0.0;
                
                if (color > 1.0)
                    gl_FragColor = vec4(0.0, 2.0 - color, color - 1.0, 1.0);
                else
                    gl_FragColor = vec4(1.0 - color, color, 0.0, 1.0);
                //if (texture2D(uBodiesTexture, vTextCoord).x == 1.0)
                    //gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
        `;
        return displayShader;
    }
    get displayBodyShaderCode() {
        let displayShader = `
            precision highp float;

            varying vec2 vTextCoord;

            uniform sampler2D uBodiesTexture;

            void main () {
                vec4 data = texture2D(uBodiesTexture, vTextCoord);
                gl_FragColor = data;
            }
        `;
        return displayShader;
    }
    get displayGraphShaderCode() {
        let displayShader = `
            precision highp float;

            varying vec2 vTextCoord;

            uniform sampler2D uVelocity;

            void main () {
                vec2 coord; 
                coord.x = 0.9; coord.y = vTextCoord.y;
                vec3 u = texture2D(uVelocity, coord).xyz;
                
                vec3 bgColor; bgColor.x = 1.0; bgColor.y = 1.0; bgColor.z = 1.0;
                vec3 graphColor; graphColor.x = 1.0; graphColor.y = 0.0; graphColor.z = 0.0;
                
                float scale = 5.0;
                float magnitude = scale * sqrt( u.x*u.x + u.y*u.y );
                float eps = 0.001;
                if (abs(vTextCoord.x - magnitude) < eps)                
                    gl_FragColor = vec4(graphColor, 1.0);
                else
                    gl_FragColor = vec4(bgColor, 1.0);
            }
        `;
        return displayShader;
    }
    //stream step
    get stream1ShaderCode() {
        let streamCode = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uDistribition1;
            uniform sampler2D uBodiesTexture;
            uniform float d;

            void main () {
                float rev = -1.0 * d; float dx = 0.1;

                vec2 coord = vTextCoord; coord.x += 1.0 * rev * dx;
                if (coord.x > 1.0) coord.x = 1.0;
                float f1 = texture2D(uDistribition1, coord).r;

                coord = vTextCoord; coord.y += 1.0 * rev; if (coord.x > 1.0) coord.x = 1.0;
                float f2 = texture2D(uDistribition1, coord).g;

                coord = vTextCoord; coord.x -= 1.0 * rev * dx; if (coord.x > 1.0) coord.x = 1.0;
                float f3 = texture2D(uDistribition1, coord).b;

                coord = vTextCoord; coord.y -= 1.0 * rev; if (coord.x > 1.0) coord.x = 1.0;
                float f4 = texture2D(uDistribition1, coord).a;

                if (vTextCoord.y >= 1.0 - d)
                    f4 = f2;
                if (vTextCoord.y <= d)
                    f2 = f4;

                if (texture2D(uBodiesTexture, vTextCoord).r == 1.0){
                    coord = vTextCoord; coord.x += 1.0 * rev;
                    if (coord.x > 1.0) coord.x = 1.0; if (coord.x < 0.0) coord.x = 0.0;
                    //if (texture2D(uBodiesTexture, coord).r == 0.0)
                        f3 = f1;

                    coord = vTextCoord; coord.y += 1.0 * rev;
                    if (coord.x > 1.0) coord.x = 1.0; if (coord.x < 0.0) coord.x = 0.0;
                    //if (texture2D(uBodiesTexture, coord).r == 0.0)
                        f4 = f2;

                    coord = vTextCoord; coord.x -= 1.0 * rev;
                    if (coord.x > 1.0) coord.x = 1.0; if (coord.x < 0.0) coord.x = 0.0;
                    //if (texture2D(uBodiesTexture, coord).r == 0.0)
                        f1 = f3;

                    coord = vTextCoord; coord.y -= 1.0 * rev;
                    if (coord.x > 1.0) coord.x = 1.0; if (coord.x < 0.0) coord.x = 0.0;
                    //if (texture2D(uBodiesTexture, coord).r == 0.0)
                        f2 = f4;
                };

                gl_FragColor = vec4(f1, f2, f3, f4);
            }
        `;
        return streamCode;
    }
    get stream2ShaderCode() {
        let streamCode = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uDistribition2;
            uniform sampler2D uBodiesTexture;
            uniform float d;

            void main () {
                float rev = -1.0 * d; float dx = 0.1;

                vec2 coord = vTextCoord; coord.x += 1.0 * rev; coord.y += 1.0 * rev; 
                if (coord.x > 1.0) coord.x = 1.0; if (coord.x < 0.0) coord.x = 0.0;
                float f5 = texture2D(uDistribition2, coord).r;

                coord = vTextCoord; coord.x -= 1.0 * rev; coord.y += 1.0 * rev; 
                if (coord.x > 1.0) coord.x = 1.0; if (coord.x < 0.0) coord.x = 0.0;
                float f6 = texture2D(uDistribition2, coord).g;

                coord = vTextCoord; coord.x -= 1.0 * rev; coord.y -= 1.0 * rev; 
                if (coord.x > 1.0) coord.x = 1.0; if (coord.x < 0.0) coord.x = 0.0;
                float f7 = texture2D(uDistribition2, coord).b;

                coord = vTextCoord; coord.x += 1.0 * rev; coord.y -= 1.0 * rev; 
                if (coord.x > 1.0) coord.x = 1.0; if (coord.x < 0.0) coord.x = 0.0;
                float f8 = texture2D(uDistribition2, coord).a;

                if (vTextCoord.y >= 1.0 - d)
                    {
                        f7 = f5; f8 = f6;
                    }
                if (vTextCoord.y <= d)
                    {
                        f5 = f7; f6 = f8;
                    }

                if (texture2D(uBodiesTexture, vTextCoord).r > 0.0){
                    coord = vTextCoord; coord.x += 1.0 * rev * dx; coord.y += 1.0 * rev;
                    //if (texture2D(uBodiesTexture, coord).r == 0.0)
                        f7 = f5;

                    coord = vTextCoord; coord.x -= 1.0 * rev * dx; coord.y += 1.0 * rev;
                    //if (texture2D(uBodiesTexture, coord).r == 0.0)
                        f8 = f6;

                    coord = vTextCoord; coord.x -= 1.0 * rev * dx; coord.y -= 1.0 * rev;
                    //if (texture2D(uBodiesTexture, coord).r == 0.0)
                        f5 = f7;

                    coord = vTextCoord; coord.x += 1.0 * rev * dx; coord.y -= 1.0 * rev;
                    //if (texture2D(uBodiesTexture, coord).r == 0.0)
                        f6 = f8;
                };

                gl_FragColor = vec4(f5, f6, f7, f8);
            }
        `;
        return streamCode;
    }
    //collision step
    get collision0ShaderCode() {
        let collisionCode = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uDistribition0;
            uniform sampler2D uVelocity;
            uniform float c;
            uniform float tau;

            void main () {
                float wk = 4.0/9.0;
                float cu = 0.0; float feq = 0.0; float f0 = 0.0; 

                vec3 vel = texture2D(uVelocity, vTextCoord).xyz; 
                float u = vel.r*vel.r + vel.g*vel.g; 

				feq = vel.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * u);
                f0 = texture2D(uDistribition0, vTextCoord).r;
                f0 = f0 - (f0 - feq) / tau;

                gl_FragColor = vec4(f0, 1.0, 1.0, 1.0);
            }
        `;
        return collisionCode;
    }
    get collision1ShaderCode() {
        let collisionCode = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uDistribition1;
            uniform sampler2D uVelocity;
            uniform float c;
            uniform float tau;

            void main () {
                vec2 gridCoord; float wk = 1.0/9.0;
                float cu = 0.0; float feq = 0.0; float f1 = 0.0; float f2 = 0.0; float f3 = 0.0; float f4 = 0.0;
                vec3 u = texture2D(uVelocity, vTextCoord).rgb; 
                float magnitude = u.r*u.r + u.g*u.g; 

                gridCoord.x = 1.0; gridCoord.y = 0.0;
                cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y) / c;
				feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * magnitude / (c * c));
                f1 = texture2D(uDistribition1, vTextCoord).r;
                f1 = f1 - (f1 - feq) / tau;

                gridCoord.x = 0.0; gridCoord.y = 1.0;
                cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y) / c;
				feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * magnitude / (c * c));
                f2 = texture2D(uDistribition1, vTextCoord).g;
                f2 = f2 - (f2 - feq) / tau;

                gridCoord.x = -1.0; gridCoord.y = 0.0;
                cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y) / c;
				feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * magnitude / (c * c));
                f3 = texture2D(uDistribition1, vTextCoord).b;
                f3 = f3 - (f3 - feq) / tau;

                gridCoord.x = 0.0; gridCoord.y = -1.0;
                cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y) / c;
				feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * magnitude / (c * c));
                f4 = texture2D(uDistribition1, vTextCoord).a;
                f4 = f4 - (f4 - feq) / tau;

                gl_FragColor = vec4(f1, f2, f3, f4);
            }
        `;
        return collisionCode;
    }
    get collision2ShaderCode() {
        let collisionCode = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uDistribition2;
            uniform sampler2D uVelocity;
            uniform float c;
            uniform float tau;

            void main () {
                vec2 gridCoord; float wk = 1.0/36.0;
                float cu = 0.0; float feq = 0.0; float f5 = 0.0; float f6 = 0.0; float f7 = 0.0; float f8 = 0.0;
                vec3 u = texture2D(uVelocity, vTextCoord).rgb; 
                float magnitude = u.r*u.r + u.g*u.g;

                gridCoord.x = 1.0; gridCoord.y = 1.0;
                cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y) / c;
				feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * magnitude / (c * c));
                f5 = texture2D(uDistribition2, vTextCoord).r;
                f5 = f5 - (f5 - feq) / tau;

                gridCoord.x = -1.0; gridCoord.y = 1.0;
                cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y) / c;
				feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * magnitude / (c * c));
                f6 = texture2D(uDistribition2, vTextCoord).g;
                f6 = f6 - (f6 - feq) / tau;

                gridCoord.x = -1.0; gridCoord.y = -1.0;
                cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y) / c;
				feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * magnitude / (c * c));
                f7 = texture2D(uDistribition2, vTextCoord).b;
                f7 = f7 - (f7 - feq) / tau;

                gridCoord.x = 1.0; gridCoord.y = -1.0;
                cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y) / c;
				feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * magnitude / (c * c));
                f8 = texture2D(uDistribition2, vTextCoord).a;
                f8 = f8 - (f8 - feq) / tau;

                gl_FragColor = vec4(f5, f6, f7, f8);
            }
        `;
        return collisionCode;
    }
    //outlet boundary conditions
    get OutletBC0ShaderCode() {
        let initShader = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uVelocity;
            uniform sampler2D uDistribition0;
            uniform float d;

            void main () {
                vec2 coord = vTextCoord;
                vec3 u = texture2D(uVelocity, coord).rgb;

                float f0 = texture2D(uDistribition0, coord).r;
                if (vTextCoord.x >= 1.0 - d)
                {
                    f0 = u.b * 4.0 * (1.0 - 1.5 * u.x * u.x - 1.5 * u.y * u.y) / 9.0;
                }

                gl_FragColor = vec4(f0, 0.0, 0.0, 0.0);
            }
        `;
        return initShader;
    }
    get OutletBC1ShaderCode() {
        let initShader = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uVelocity;
            uniform sampler2D uDistribition1;
            uniform float d;

            void main () {
                vec2 coord = vTextCoord;
                vec3 u = texture2D(uVelocity, coord).rgb;
                
                float umagnitude = u.r*u.r + u.g*u.g;

                float f1 = texture2D(uDistribition1, coord).r;
                float f2 = texture2D(uDistribition1, coord).g;
                float f3 = texture2D(uDistribition1, coord).b;
                float f4 = texture2D(uDistribition1, coord).a;

                vec2 gridCoord; float wk = 1.0/9.0;
                float cu = 0.0; float feq = 0.0;

                if (vTextCoord.x >= 1.0 - d)
                {
                    gridCoord.x = 1.0; gridCoord.y = 0.0;
                    cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y);
                    feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * umagnitude);
                    f1 = feq;

                    gridCoord.x = 0.0; gridCoord.y = 1.0;
                    cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y);
                    feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * umagnitude);
                    f2 = feq;

                    gridCoord.x = -1.0; gridCoord.y = 0.0;
                    cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y);
                    feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * umagnitude);
                    f3 = feq;

                    gridCoord.x = 0.0; gridCoord.y = -1.0;
                    cu = 3.0 * (gridCoord.x*u.x + gridCoord.y*u.y);
                    feq = u.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * umagnitude);
                    f4 = feq;
                }
                
                gl_FragColor = vec4(f1, f2, f3, f4);
            }
        `;
        return initShader;
    }
    get OutletBC2ShaderCode() {
        let initShader = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uVelocity;
            uniform sampler2D uDistribition2;
            uniform float d;

            void main () {
                vec2 coord = vTextCoord;
                vec3 vel = texture2D(uVelocity, coord).rgb;
                float u = vel.r*vel.r + vel.g*vel.g;

                float f5 = texture2D(uDistribition2, coord).r;
                float f6 = texture2D(uDistribition2, coord).g;
                float f7 = texture2D(uDistribition2, coord).b;
                float f8 = texture2D(uDistribition2, coord).a;

                vec2 gridCoord; float wk = 1.0/36.0;
                float cu = 0.0; float feq = 0.0;

                if (vTextCoord.x >= 1.0 - d)
                {
                    gridCoord.x = 1.0; gridCoord.y = 1.0;
                    cu = 3.0 * (gridCoord.x*vel.x + gridCoord.y*vel.y);
                    feq = vel.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * u);
                    f5 = feq;

                    gridCoord.x = -1.0; gridCoord.y = 1.0;
                    cu = 3.0 * (gridCoord.x*vel.x + gridCoord.y*vel.y);
                    feq = vel.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * u);
                    f6 = feq;

                    gridCoord.x = -1.0; gridCoord.y = -1.0;
                    cu = 3.0 * (gridCoord.x*vel.x + gridCoord.y*vel.y);
                    feq = vel.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * u);
                    f7 = feq;

                    gridCoord.x = 1.0; gridCoord.y = -1.0;
                    cu = 3.0 * (gridCoord.x*vel.x + gridCoord.y*vel.y);
                    feq = vel.z * wk * (1.0 + cu + 0.5*cu*cu - 1.5 * u);
                    f8 = feq;
                }

                gl_FragColor = vec4(f5, f6, f7, f8);
            }
        `;
        return initShader;
    }
    //inlet boundry conditions
    get FluxBC1ShaderCode() {
        let initShader = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uDistribition0;
            uniform sampler2D uDistribition1;
            uniform sampler2D uDistribition2;
            uniform sampler2D uVelocity;

            void main () {
                float rho = texture2D(uVelocity, vTextCoord).b;
                float f0 = texture2D(uDistribition0, vTextCoord).r;
                float f1 = texture2D(uDistribition1, vTextCoord).r;
                float f2 = texture2D(uDistribition1, vTextCoord).g;
                float f3 = texture2D(uDistribition1, vTextCoord).b;
                float f4 = texture2D(uDistribition1, vTextCoord).a;
                float f5 = texture2D(uDistribition2, vTextCoord).r;
                float f6 = texture2D(uDistribition2, vTextCoord).g;
                float f7 = texture2D(uDistribition2, vTextCoord).b;
                float f8 = texture2D(uDistribition2, vTextCoord).a;

                if (vTextCoord.x <= 0.005)
                {
                    rho = (f0 + f2 + f4 + 2.0 * (f3 + f6 + f7)) / (1.0 - 0.1);
                    f1 = f3 + 2.0 * rho * 0.1 / (3.0);
                }
                
                gl_FragColor = vec4(f1, f2, f3, f4);
            }
        `;
        return initShader;
    }
    get FluxBC2ShaderCode() {
        let initShader = `
            precision highp float;

            varying vec2 vTextCoord;
            uniform sampler2D uDistribition0;
            uniform sampler2D uDistribition1;
            uniform sampler2D uDistribition2;
            uniform sampler2D uVelocity;

            void main () {
                float rho = texture2D(uVelocity, vTextCoord).b; 

                float f0 = texture2D(uDistribition0, vTextCoord).r;
                float f1 = texture2D(uDistribition1, vTextCoord).r;
                float f2 = texture2D(uDistribition1, vTextCoord).g;
                float f3 = texture2D(uDistribition1, vTextCoord).b;
                float f4 = texture2D(uDistribition1, vTextCoord).a;

                float f5 = texture2D(uDistribition2, vTextCoord).r;
                float f6 = texture2D(uDistribition2, vTextCoord).g;
                float f7 = texture2D(uDistribition2, vTextCoord).b;
                float f8 = texture2D(uDistribition2, vTextCoord).a;

                if (vTextCoord.x <= 0.005)
                {
                    rho = (f0 + f2 + f4 + 2.0 * (f3 + f6 + f7)) / (1.0 - 0.1);
                    f5 = f7 + 0.5 * (f4 - f2) + rho * 0.1 / (6.0);
                    f8 = f6 + 0.5 * (f2 - f4) + rho * 0.1 / (6.0);
                }

                gl_FragColor = vec4(f5, f6, f7, f8);
            }
        `;
        return initShader;
    }
    //bodies
    get initializeCircleBodyShaderCode(){
        let initShader = `
        precision highp float;

            varying vec2 vTextCoord;

            void main () {
                float R = 0.0625;
                vec2 center; center.x= 1.0; center.y = 0.5;
                float dx = 0.1;
                float r = (vTextCoord.x - center.x * dx)*(vTextCoord.x - center.x * dx)/dx + 
                            (vTextCoord.y - center.y) * (vTextCoord.y - center.y);
                
                if (r <= R*R)
                    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0);
                else
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                //if (vTextCoord.x >= 0.24 && vTextCoord.x <= 0.25 && vTextCoord.y >= 0.4 && vTextCoord.y <= 0.6)
                //    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0);
                //else
                //    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
        `;
        return initShader;
    }
}
//self-calling function
(function () {
    let canvas = document.getElementById('canvas'); //alpha: false, preserveDrawingBuffer: false, depth: false, stencil: false
    const gl = canvas.getContext('webgl');
    const time = document.getElementById('time');

    const float = gl.getExtension('OES_texture_float');
    const support_linear_float = gl.getExtension('OES_texture_float_linear'); 

    resizeCanvas();

    const GRIDN = 200.0;
    const DOMAINSIZEX = 1.0;
    const DOMAINSIZEY = 1.0;
    const GRIDX = DOMAINSIZEX * GRIDN;
    const GRIDY = DOMAINSIZEY * GRIDN;
    const CELLSIZE = 1.0 / GRIDN;
    const UIN = 0.1;
    const L = 0.125;
    const C = 1.0;
    const CS = C / Math.sqrt(3);
    const DT = CELLSIZE;
    const RE = 200.0;
    const VISCOSITY = UIN * L / RE;
    const TAU = 3.0 * VISCOSITY * GRIDN + 0.5;
    console.log(TAU, VISCOSITY);

    let texId = -1;

    function display(target) {
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function clear (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    
    function createFBO (width, height, format, type, param) {
        texId++;
        gl.activeTexture(gl.TEXTURE0 + texId);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, null);

        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, width, height);

        return [texture, fbo, texId];
    }

    function createDoubleFBO (width, height, format, type, param) {
        let fbo1 = createFBO(width, height, format, type, param);
        let fbo2 = createFBO(width, height, format, type, param);

        return {
            get first () {
                return fbo1;
            },
            get second () {
                return fbo2;
            },
            swap: () => {
                let temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
            }
        }
    }
    //support_linear_float ? gl.LINEAR : gl.NEAREST
    let distribution0 = createDoubleFBO(GRIDX, GRIDY, gl.RGBA, gl.FLOAT, gl.NEAREST);
    let distribution1 = createDoubleFBO(GRIDX, GRIDY, gl.RGBA, gl.FLOAT, gl.NEAREST);
    let distribution2 = createDoubleFBO(GRIDX, GRIDY, gl.RGBA, gl.FLOAT, gl.NEAREST);

    let velocity    = createFBO(GRIDX, GRIDY, gl.RGBA, gl.FLOAT, support_linear_float ? gl.LINEAR : gl.NEAREST);
    let bodies      = createFBO(GRIDX, GRIDY, gl.RGBA, gl.FLOAT, support_linear_float ? gl.LINEAR : gl.NEAREST);

    let shaders = new Shaders(gl); let i = 0;
    Initialize();
    let startTime = performance.now();
    LBMLoop();

    function Initialize () {
        gl.viewport(0, 0, GRIDX, GRIDY);
        shaders.initializeDistribution0Program.use();
        display(distribution0.first[1]);

        shaders.initializeDistribution1Program.use();
        display(distribution1.first[1]);

        shaders.initializeDistribution2Program.use();
        display(distribution2.first[1]);

        initializeCircleBody();
        calculateVelocityDencity();
    }
    function LBMLoop() {
        resizeCanvas();
        gl.viewport(0, 0, GRIDX, GRIDY);

        collisionStep();
        streamStep();
        fluxBC();
        outletBC();
        calculateVelocityDencity();        

        //displayBody();
        displayVelocityField();
        //displayGraph();

        i++; 
        time.textContent = ` t = ${timeFormat(i*DT, 2)}; sim time = ${timeFormat((performance.now() - startTime)/1000,2)} c`;
        requestAnimationFrame(LBMLoop);
    } 
    //LBM functions 
    function calculateVelocityDencity(){
        shaders.calculateVelocityDencityProgram.use();
        gl.uniform1i(shaders.calculateVelocityDencityProgram.uniforms.uDistribution0, distribution0.first[2]);
        gl.uniform1i(shaders.calculateVelocityDencityProgram.uniforms.uDistribution1, distribution1.first[2]);
        gl.uniform1i(shaders.calculateVelocityDencityProgram.uniforms.uDistribution2, distribution2.first[2]);
        gl.uniform1f(shaders.calculateVelocityDencityProgram.uniforms.c, C);

        display(velocity[1]);
    }
    function collisionStep(){
        shaders.collision0Program.use();
        gl.uniform1i(shaders.collision0Program.uniforms.uDistribition0, distribution0.first[2]);
        gl.uniform1i(shaders.collision0Program.uniforms.uVelocity, velocity[2]);
        gl.uniform1f(shaders.collision0Program.uniforms.c, C);
        gl.uniform1f(shaders.collision0Program.uniforms.tau, TAU);

        display(distribution0.second[1]);
        distribution0.swap();

        shaders.collision1Program.use();
        gl.uniform1i(shaders.collision1Program.uniforms.uDistribition1, distribution1.first[2]);
        gl.uniform1i(shaders.collision1Program.uniforms.uVelocity, velocity[2]);
        gl.uniform1f(shaders.collision1Program.uniforms.c, C);
        gl.uniform1f(shaders.collision1Program.uniforms.tau, TAU);

        display(distribution1.second[1]);
        distribution1.swap();

        shaders.collision2Program.use();
        gl.uniform1i(shaders.collision2Program.uniforms.uDistribition2, distribution2.first[2]);
        gl.uniform1i(shaders.collision2Program.uniforms.uVelocity, velocity[2]);
        gl.uniform1f(shaders.collision2Program.uniforms.c, C);
        gl.uniform1f(shaders.collision2Program.uniforms.tau, TAU);

        display(distribution2.second[1]);
        distribution2.swap();
    }
    function streamStep(){
        shaders.stream1Program.use();
        gl.uniform1i(shaders.stream1Program.uniforms.uDistribition1, distribution1.first[2]);
        gl.uniform1i(shaders.stream1Program.uniforms.uBodiesTexture, bodies[2]);
        gl.uniform1f(shaders.stream1Program.uniforms.d, CELLSIZE);
        display(distribution1.second[1]);
        distribution1.swap();

        shaders.stream2Program.use();
        gl.uniform1i(shaders.stream2Program.uniforms.uDistribition2, distribution2.first[2]);
        gl.uniform1i(shaders.stream2Program.uniforms.uBodiesTexture, bodies[2]);
        gl.uniform1f(shaders.stream2Program.uniforms.d, CELLSIZE);
        display(distribution2.second[1]);
        distribution2.swap();
    }
    function fluxBC(){
        shaders.fluxVelProgram.use();
        gl.uniform1i(shaders.fluxVelProgram.uniforms.uDistribution0, distribution0.first[2]);
        gl.uniform1i(shaders.fluxVelProgram.uniforms.uDistribution1, distribution1.first[2]);
        gl.uniform1i(shaders.fluxVelProgram.uniforms.uDistribution2, distribution2.first[2]);
        display(velocity[1]);

        shaders.flux1Program.use();
        gl.uniform1i(shaders.flux1Program.uniforms.uDistribition0, distribution0.first[2]);
        gl.uniform1i(shaders.flux1Program.uniforms.uDistribition1, distribution1.first[2]);
        gl.uniform1i(shaders.flux1Program.uniforms.uDistribition2, distribution2.first[2]);
        gl.uniform1i(shaders.flux1Program.uniforms.uVelocity, velocity[2]);
        display(distribution1.second[1]);
        distribution1.swap();

        shaders.flux2Program.use();
        gl.uniform1i(shaders.flux2Program.uniforms.uDistribition0, distribution0.first[2]);
        gl.uniform1i(shaders.flux2Program.uniforms.uDistribition1, distribution1.first[2]);
        gl.uniform1i(shaders.flux2Program.uniforms.uDistribition2, distribution2.first[2]);
        gl.uniform1i(shaders.flux2Program.uniforms.uVelocity, velocity[2]);
        display(distribution2.second[1]);
        distribution2.swap();
    }
    function outletBC(){
        shaders.calculateOutletVelocityProgram.use();
        gl.uniform1i(shaders.calculateOutletVelocityProgram.uniforms.uDistribution0, distribution0.first[2]);
        gl.uniform1i(shaders.calculateOutletVelocityProgram.uniforms.uDistribution1, distribution1.first[2]);
        gl.uniform1i(shaders.calculateOutletVelocityProgram.uniforms.uDistribution2, distribution2.first[2]);
        gl.uniform1f(shaders.calculateOutletVelocityProgram.uniforms.c, C);

        display(velocity[1]);

        //distributions     
       
        shaders.outletBC0Program.use();
        gl.uniform1i(shaders.outletBC0Program.uniforms.uDistribition0, distribution0.first[2]);
        gl.uniform1i(shaders.outletBC0Program.uniforms.uVelocity, velocity[2]);
        gl.uniform1f(shaders.outletBC0Program.uniforms.d, CELLSIZE);

        display(distribution0.second[1]);
        distribution0.swap();

        shaders.outletBC1Program.use();
        gl.uniform1i(shaders.outletBC1Program.uniforms.uDistribition1, distribution1.first[2]);
        gl.uniform1i(shaders.outletBC1Program.uniforms.uVelocity, velocity[2]);
        gl.uniform1f(shaders.outletBC1Program.uniforms.d, CELLSIZE);

        display(distribution1.second[1]);
        distribution1.swap();

        shaders.outletBC2Program.use();
        gl.uniform1i(shaders.outletBC2Program.uniforms.uDistribition2, distribution2.first[2]);
        gl.uniform1i(shaders.outletBC2Program.uniforms.uVelocity, velocity[2]);
        gl.uniform1f(shaders.outletBC2Program.uniforms.d, CELLSIZE);

        display(distribution2.second[1]);
        distribution2.swap();
    }
    function displayVelocityField(){
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        shaders.displayProgram.use();
        gl.uniform1i(shaders.displayProgram.uniforms.uVelocity, velocity[2]);
        gl.uniform1i(shaders.displayProgram.uniforms.uBodiesTexture, bodies[2]);
        display(null);
    }
    function displayBody(){
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        shaders.displayBodyProgram.use();
        gl.uniform1i(shaders.displayBodyProgram.uniforms.uBodiesTexture, bodies[2]);
        display(null);
    }
    function displayGraph(){
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);        
        shaders.displayGraphProgram.use();        
        gl.uniform1i(shaders.displayGraphProgram.uniforms.uVelocity, velocity[2]);
        display(null);
    }
    function initializeCircleBody(){
        shaders.initializeCircleBodyProgram.use();
        display(bodies[1]);
    }

    function resizeCanvas() {
        canvas.width  = innerWidth;
        canvas.height = innerHeight;
    }
    function timeFormat(time, count) {
        let str = String(time);
        return str.substr(0, count + 2);
    }

}())