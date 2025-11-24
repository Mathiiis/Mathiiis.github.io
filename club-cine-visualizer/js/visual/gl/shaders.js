let Shaders = new function() {

    this.vertShader =
        "attribute float size; \
        attribute float alpha; \
        attribute float rotation; \
        attribute float textureIndex; \
        uniform vec3 color; \
        varying float vAlpha; \
        varying vec3 vColor; \
        varying float vRotation; \
        varying float vTextureIndex; \
        void main() { \
            vColor = color; \
            vAlpha = alpha; \
            vRotation = rotation; \
            vTextureIndex = textureIndex; \
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); \
            gl_PointSize = 100.0 * size / length(mvPosition.xyz); \
            gl_Position = projectionMatrix * mvPosition; \
        }";

    this.fragShader =
        "uniform sampler2D texture0; \
        uniform sampler2D texture1; \
        uniform sampler2D texture2; \
        varying float vAlpha; \
        varying vec3 vColor; \
        varying float vRotation; \
        varying float vTextureIndex; \
        vec2 rotatePoint(vec2 uv, float angle) { \
            float s = sin(angle); \
            float c = cos(angle); \
            vec2 centered = uv - vec2(0.5); \
            return vec2(c * centered.x - s * centered.y, s * centered.x + c * centered.y) + vec2(0.5); \
        } \
        void main() { \
            vec2 rotatedUv = rotatePoint(gl_PointCoord, vRotation); \
            vec4 texColor; \
            if (vTextureIndex < 0.5) { \
                texColor = texture2D(texture0, rotatedUv); \
            } else if (vTextureIndex < 1.5) { \
                texColor = texture2D(texture1, rotatedUv); \
            } else { \
                texColor = texture2D(texture2, rotatedUv); \
            } \
            gl_FragColor = vec4(vColor, vAlpha) * texColor; \
        }";

}
