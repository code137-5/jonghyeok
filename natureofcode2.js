import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Circle {
    constructor() {
        const divContainer = document.querySelector('#webgl-container');
        this._divContainer = divContainer;
        /**랜더러 생성 */
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        /**랜더러 객체 setPixelRatio값 정의 */
        renderer.setPixelRatio(window.devicePixelRatio);
        /**divContainer에 canvas생성 */
        divContainer.appendChild(renderer.domElement);
        this._renderer = renderer;
        /**마우스를 땠을때 큐브가 움직이게 하는 변수 */
        this._isCube = false;
        /**scene객체 생성 */
        const scene = new THREE.Scene();
        /**필드화 시킴 */
        this._scene = scene;
        /**큐브 위치 */
        this._location = new THREE.Vector3(0, 0, 0);
        /**location에 더할 변수 가속도 */
        this._velocity = new THREE.Vector3(0, 0, 0);
        /**특정 위치에서 다른 위치로 향하게 하는 변수 */
        this._dir = new THREE.Vector3(0, 0, 0);

        /**마우스 위치 */
        this._mouse = new THREE.Vector3(0, 0, 0);
        /**큐브 생성 위치 */
        this._center = new THREE.Vector3(0, 0, 0);
        /**마우스를 움직일때마다 라인이 생성되는게 아니라 클릭 이후에 움직이면 생성되게 */
        this._isLine = false;
        /**라인 길이 */
        this._length;
        /**큐브의 질량 */
        this._mass = 10;
        /**가속도 */
        this._speed;
        /**중력 */
        this._gravity = new THREE.Vector3(0, -0.1, 0);
        /**마찰 계수 0.6보다 작으면 안됨*/
        this._friction = Math.max(1 - 0.01 * this._mass, 0.6);
        this._setupCamera();
        this._setupLight();
        this._setupModel();
        this._setupControls();

        /**창크기가 변경될때 발생 bind을 사용한 이유는 this가 app클래스 객체가 되기위함 */
        window.onresize = this.resize.bind(this);
        this.resize();

        /**render메서드는 3차원 그래픽장면을 만들어주는 메서드 */
        requestAnimationFrame(this.render.bind(this));
    }
    /** 카메라 설정 */
    _setupCamera() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        camera.position.set(0, 0, 5);
        this._camera = camera;
    }
    _setupControls() {
        const material = new THREE.LineBasicMaterial({
            color: 0x0000ff,
        });
        let points = [];
        /**마우스를 눌렀을때 설정 이전값들 초기화 및 큐브를 마우스 찍은곳에 생성 */
        this._divContainer.addEventListener('mousedown', (event) => {
            this._isCube = false;
            this._location = new THREE.Vector3(0, 0, 0);
            this._velocity = new THREE.Vector3(0, 0, 0);
            this._dir = new THREE.Vector3(0, 0, 0);
            this._cube.removeFromParent();
            this._center = new THREE.Vector3(
                ((event.clientX / this._divContainer.clientWidth) * 2 - 1) *
                    6.5,
                -((event.clientY / this._divContainer.clientHeight) * 2 - 1) *
                    3,
                0
            );

            this._cube.position.set(this._center.x, this._center.y, 0);

            this._scene.add(this._cube);

            points.push(new THREE.Vector3(this._center.x, this._center.y, 0));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this._line = new THREE.Line(geometry, material);
            this._scene.add(this._line);
            this._isLine = true;
        });

        /**마우스를 땠을때 라인을 지우고 큐브가 라인 방향으로 이동하게 설정 */
        this._divContainer.addEventListener('mouseup', (event) => {
            this._isCube = true;

            this._scene.children.map((object) => {
                if (object.type === 'Line') {
                    this._scene.remove(object);
                }
            });

            this._dir = this._mouse.clone().sub(this._center).normalize();

            this._length = this._center.distanceTo(this._mouse);
            /**9를 넘어가면 화면을 넘어가기에 limit를 줌 */
            if (this._length > 6) {
                this._length = 5;
            } else if (this._length < 0.1) {
                this._length = 0.1;
            }
            this._velocity.add(this._dir);

            /**가속도 */
            this._speed = this._length / this._mass;
            console.log(this._length);
            points = [];
            this._isLine = false;
        });

        /**마우스를 움직일때마다 라인을 변경 */
        this._divContainer.addEventListener('mousemove', (event) => {
            if (this._isLine) {
                this._mouse = new THREE.Vector3(
                    ((event.clientX / this._divContainer.clientWidth) * 2 - 1) *
                        6.5,
                    -(
                        (event.clientY / this._divContainer.clientHeight) * 2 -
                        1
                    ) * 3,
                    0
                );

                points = [this._center, this._mouse];

                const geometry = new THREE.BufferGeometry().setFromPoints(
                    points
                );

                this._line.geometry = geometry;
            }
        });
    }
    _setupLight() {
        /**메인광 */
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this._scene.add(ambientLight);
        const directionLight = new THREE.DirectionalLight(0xfffff, 1);
        directionLight.position.set(-1, 2, 4);
        this._scene.add(directionLight);
    }
    _setupModel() {
        //큐브 생성
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x44a88 });
        const cube = new THREE.Mesh(geometry, material);
        this._cube = cube;
    }
    resize() {
        /** divCotainer의 width과height를 가져옴  */
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        /**카메라 속성값 설정 */
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        /**설정한 값으로 renderer 크기 설정 */
        this._renderer.setSize(width, height);
    }
    render(time) {
        /**render가 _scene을 _camera시점을 이용해서 렌더링   */
        this._renderer.render(this._scene, this._camera);
        this.update(time);
        /** 애니메이션 업데이트 */
        /**this.render.bind(this) this.render 함수가 현재 객체의 메서드로 실행되게 */
        requestAnimationFrame(this.render.bind(this));
    }
    update(time) {
        if (this._isCube) {
            time *= 0.001;
            this._cube.rotation.x = time;
            this._cube.rotation.y = time;
            /**중력을 더한다. */
            this._velocity.add(
                this._gravity.clone().multiplyScalar(this._mass * 0.01)
            );
            /**큐브가 이동할 위치 */
            this._location.add(this._velocity);

            /**현재 위치에 속도를 곱한다. */
            this._location.multiplyScalar(this._speed);

            /**큐브가 this._location방향으로 이동 set을사용하면 순간이동하니 add로 하나씩 더해서  */
            this._cube.position.add(this._location);
            console.log(this._friction);
            // 화면 경계에 부딪혔을 때
            const boundaryX = this._divContainer.clientWidth / 400;
            const boundaryY = this._divContainer.clientHeight / 400;

            if (
                this._cube.position.x > boundaryX ||
                this._cube.position.x < -boundaryX
            ) {
                // 큐브가 화면 경계 내에서만 이동하도록 제한 해당코드 없으면 큐브가 어느순간 멈춤
                this._cube.position.x = Math.min(
                    boundaryX,
                    Math.max(-boundaryX, this._cube.position.x)
                );

                // x 이동 방향 반전
                this._velocity.x *= -1;
                this._velocity.multiplyScalar(this._friction);
            }
            if (
                this._cube.position.y > boundaryY ||
                this._cube.position.y < -boundaryY
            ) {
                // 큐브가 화면 경계 내에서만 이동하도록 제한  해당코드 없으면 큐브가 멈춤
                /**이 부분은 큐브의 y 위치가 위 경계보다 커지지 않도록 보정하는 역할
                 *  this._cube.position.y가 boundaryY보다 크면, boundaryY 가 반환되어
                 *  큐브의 y 위치가 boundaryY보다 커지지 않도록 보장*/
                this._cube.position.y = Math.min(
                    boundaryY,
                    /**y 위치가 아래 경계보다 작아지지 않도록 보정하는 역할 */
                    /**this._cube.position.y가 -boundaryY보다 작으면,
                     * -boundaryY가 반환되어
                     * 큐브의 y 위치가 -boundaryY보다 작아지지 않도록 보장 */
                    Math.max(-boundaryY, this._cube.position.y)
                );

                // y 이동 방향 반전
                this._velocity.y *= -1;
                this._velocity.multiplyScalar(this._friction);
            }
        }
    }
}
