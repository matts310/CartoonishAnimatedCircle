import React, {
  Component,
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Easing,
  Dimensions
} from 'react-native';

import Point from 'point-geometry';

export default class AnimatedCircle extends Component {
  constructor(props){
    super(props);
    
    this.state = {
      pan: new Animated.ValueXY(0,0),
      v : new Animated.ValueXY(0,0),
      rotation : new Animated.Value(0)
    }

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture : ()=> true,
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({
          x: this.state.pan.x._value,
          y: this.state.pan.y._value,
          dist: Math.sqrt(this.state.pan.y._value * this.state.pan.y._value + this.state.pan.x._value * this.state.pan.x._value)
        });
        this.state.pan.setValue({
          x: 0,
          y: 0,
          dist: 0
        });
      },
      onPanResponderMove: Animated.event([
        null, {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
          vx: this.state.v.x,
          vy: this.state.v.y
        }
      ],{listener:() => this.setRotation()}),

      onPanResponderRelease: (e, gesture) => {
        Animated.spring(
          this.state.pan, {
            toValue: {
              x: 0,
              y: 0
            }
          }
        ).start();
      }
    });
  }
 
  setRotation() {
    this.state.rotation.setValue(new Point(this.state.v.x._value,this.state.v.y._value).angle());
    // console.log(this.state.rotation._value);
  }

  createTransform(){
    return {transform:[{rotate:this.state.rotation.interpolate({inputRange:[0,6.28318531],outputRange:['0rad','6.28318531rad']})}, {scaleX:this.state.v.x.interpolate({inputRange:[-4,0,4],outputRange:[1.7,1,1.7],extrapolate:'clamp'})},{rotate:this.state.rotation.interpolate({inputRange:[0,6.28318531],outputRange:['6.28318531rad','0rad']})}]}
  }

  render(){
    return (
      <Animated.View style={[styles.circle, this.state.pan.getLayout(), this.createTransform()]} {...this.panResponder.panHandlers}>
        <Text>--></Text>
      </Animated.View>
    )
  }
}


const styles = StyleSheet.create({
  circle: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
    backgroundColor:'blue',
    alignItems:'center',
    justifyContent:'center'
  }
});
