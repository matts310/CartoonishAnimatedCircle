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
  static defaultProps = {
    radius: 50,
    maxElongationScale : 2,
    maxContractionScale : .8,
    maxVelocity : 4,
    bounceFriction : 4,
    scaleFriction : 3
  };

  static propTypes = {
    radius: React.PropTypes.number,
    maxElongationScale: React.PropTypes.number,
    maxContractionScale : React.PropTypes.number,
    maxVelocity : React.PropTypes.number,
    bounceFriction: React.PropTypes.number,
    scaleFriction: React.PropTypes.number,
    children: React.PropTypes.element.isRequired
  };

  constructor(props){
    super(props);
    
    this.state = {
      pan: new Animated.ValueXY(0,0),
      v : new Animated.ValueXY(0,0),
      vMag : new Animated.Value(0.0),
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
      ],{listener:() => this.setRotationAndVelocity()}),

      onPanResponderRelease: (e, gesture) => {
        // stagger just to emphasize the woblle afterwards
        Animated.stagger(50, [Animated.spring(
          this.state.pan, {
            toValue: {
              x: 0,
              y: 0,
            }, friction: this.props.bounceFriction  
          }
        ), Animated.spring(this.state.vMag, {
          toValue: 0,
          friction: this.props.scaleFriction
        })]).start()
      }
    });
  }
 
  setRotationAndVelocity() {
    const velocityVector = new Point(this.state.v.x._value,this.state.v.y._value)
    this.state.rotation.setValue(velocityVector.angle());
    this.state.vMag.setValue(velocityVector.mag());
  }

  createTransform(){
    const maxV = this.props.maxVelocity;
    const twicePi = Math.PI * 2;
    return {transform:[
        {rotate:this.state.rotation.interpolate({inputRange:[0,twicePi],outputRange:['0rad', twicePi + 'rad']})},
        {scaleX:this.state.vMag.interpolate({inputRange:[-1*maxV,0,maxV],outputRange:[this.props.maxElongationScale,1,this.props.maxElongationScale],extrapolate:'clamp'})},
        {scaleY:this.state.vMag.interpolate({inputRange:[-1*maxV,0,maxV],outputRange:[this.props.maxContractionScale,1,this.props.maxContractionScale],extrapolate:'clamp'})},
        {rotate:this.state.rotation.interpolate({inputRange:[0,twicePi],outputRange:[twicePi + 'rad','0rad']})}
      ]};
  }

  render(){
    this.props.children.props.style.width = this.props.radius*2;
    this.props.children.props.style.height = this.props.radius*2;
    this.props.children.props.style.borderRadius = this.props.radius;
    this.props.children.props.style.alignItems = 'center';
    this.props.children.props.style.justifyContent = 'center';
    return (
      <Animated.View  style={[{...this.props.style},{width:this.props.radius*2,height:this.props.radius*2,borderRadius:this.props.radius},styles.circle, this.state.pan.getLayout(), this.createTransform()]} {...this.panResponder.panHandlers}>
        {this.props.children}
      </Animated.View>
    )
  }
}


const styles = StyleSheet.create({
  circle: {
    alignItems:'center',
    justifyContent:'center'
  }
});
